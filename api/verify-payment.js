import { env } from "node:process";

const EXPECTED_AMOUNT = 42000;
const EXPECTED_CURRENCY = "GHS";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const reference = req.query?.reference;
  if (
    typeof reference !== "string" ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(reference)
  ) {
    return res.status(400).json({ message: "A valid payment reference is required" });
  }

  const secret = env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return res.status(500).json({ message: "Payment verification is not configured" });
  }

  let paystackResponse;
  try {
    paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch (error) {
    console.error("Unable to reach Paystack to verify payment", error);
    return res.status(502).json({ message: "Could not verify payment with Paystack" });
  }

  if (!paystackResponse.ok) {
    console.error("Paystack payment verification failed", {
      status: paystackResponse.status,
    });
    return res.status(502).json({ message: "Could not verify payment with Paystack" });
  }

  let result;
  try {
    result = await paystackResponse.json();
  } catch (error) {
    console.error("Paystack returned an invalid verification response", error);
    return res.status(502).json({ message: "Could not verify payment with Paystack" });
  }

  const payment = result?.data;
  const checks = {
    successful: result?.status === true && payment?.status === "success",
    referenceMatches: payment?.reference === reference,
    amountMatches: payment?.amount === EXPECTED_AMOUNT,
    currencyMatches: payment?.currency === EXPECTED_CURRENCY,
  };
  const verified = Object.values(checks).every(Boolean);

  if (!verified) {
    console.warn("Paystack transaction did not meet course payment requirements", {
      referenceMatches: checks.referenceMatches,
      transactionStatus: payment?.status,
      amount: payment?.amount,
      currency: payment?.currency,
    });
  }

  return res.status(200).json({
    verified,
    reason: verified
      ? undefined
      : !checks.successful
        ? "not_successful"
        : !checks.referenceMatches
          ? "reference_mismatch"
          : !checks.amountMatches
            ? "amount_mismatch"
            : "currency_mismatch",
  });
}
