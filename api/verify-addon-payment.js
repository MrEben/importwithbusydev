import { env } from "node:process";
import { getSessionEmail } from "../lib/server/lmsSession.js";
import {
  getCoursePurchases,
  storeCourseAddonPurchase,
} from "../lib/server/lmsPurchases.js";
import { COURSE_ADD_ONS } from "../src/data/course-offers.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Vary", "Cookie");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const sessionSecret = env.LMS_SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    console.error("LMS_SESSION_SECRET must be configured with at least 32 characters");
    return res.status(500).json({ message: "LMS authentication is not configured" });
  }
  const email = getSessionEmail(req, sessionSecret);
  if (!email) {
    return res.status(401).json({ message: "Sign in to verify this add-on payment" });
  }

  const reference = req.query?.reference;
  if (typeof reference !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(reference)) {
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
    console.error("Unable to reach Paystack to verify add-on payment", error);
    return res.status(502).json({ message: "Could not verify payment with Paystack" });
  }
  if (!paystackResponse.ok) {
    console.error("Paystack add-on payment verification failed", {
      status: paystackResponse.status,
    });
    return res.status(502).json({ message: "Could not verify payment with Paystack" });
  }

  let result;
  try {
    result = await paystackResponse.json();
  } catch (error) {
    console.error("Paystack returned an invalid add-on verification response", error);
    return res.status(502).json({ message: "Could not verify payment with Paystack" });
  }

  const payment = result?.data;
  const addOn = COURSE_ADD_ONS.find(
    (candidate) => candidate.id === payment?.metadata?.add_on_id,
  );
  const checks = {
    successful: result?.status === true && payment?.status === "success",
    referenceMatches: payment?.reference === reference,
    purchaseTypeMatches: payment?.metadata?.purchase_type === "lms_addon",
    addOnMatches: Boolean(addOn),
    amountMatches: Boolean(addOn) && payment?.amount === addOn.priceGhs * 100,
    currencyMatches: payment?.currency === "GHS",
    emailMatches:
      typeof payment?.customer?.email === "string" &&
      payment.customer.email.trim().toLowerCase() === email,
  };
  const verified = Object.values(checks).every(Boolean);
  if (!verified) {
    return res.status(200).json({
      verified: false,
      reason: !checks.successful
        ? "not_successful"
        : !checks.referenceMatches
          ? "reference_mismatch"
          : !checks.emailMatches
            ? "email_mismatch"
            : !checks.addOnMatches || !checks.purchaseTypeMatches || !checks.amountMatches
              ? "amount_mismatch"
              : "currency_mismatch",
    });
  }

  let purchases;
  try {
    purchases = await getCoursePurchases(email);
    if (purchases.length === 0) {
      return res.status(403).json({ message: "No existing course purchase was found for this LMS account" });
    }
    await storeCourseAddonPurchase({
      email,
      reference,
      addOnId: addOn.id,
      amountPesewas: payment.amount,
      purchasedAt: payment.paid_at,
    });
  } catch (error) {
    console.error("Unable to update LMS account after verified add-on payment", error);
    return res.status(503).json({
      message: "Payment was confirmed, but your existing course account could not be updated. Please retry shortly.",
    });
  }

  return res.status(200).json({
    verified: true,
    addOnId: addOn.id,
    addOnName: addOn.name,
    amountPesewas: payment.amount,
  });
}
