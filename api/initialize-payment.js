import { getCourseTotalPesewas, COURSE_ADD_ONS } from "../src/data/course-offers.js";
import { env } from "node:process";

const DEFAULT_SITE_URL = "https://importwithbusydev.vercel.app";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const email = req.body?.email;
  const addOnIds = req.body?.addOnIds ?? [];
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  if (
    !Array.isArray(addOnIds) ||
    addOnIds.some((id) => typeof id !== "string") ||
    new Set(addOnIds).size !== addOnIds.length ||
    addOnIds.some((id) => !COURSE_ADD_ONS.some((addOn) => addOn.id === id))
  ) {
    return res.status(400).json({ message: "Invalid course add-ons selected" });
  }

  const secret = env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return res.status(500).json({ message: "Payment is not configured" });
  }

  let paystackResponse;
  try {
    paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: getCourseTotalPesewas(addOnIds),
        currency: "GHS",
        callback_url: new URL("/thank-you", env.SITE_URL || DEFAULT_SITE_URL).toString(),
        metadata: {
          course_item_ids: ["complete-importation-masterclass", ...addOnIds],
        },
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error("Unable to initialize Paystack transaction", error);
    return res.status(502).json({ message: "Could not start payment with Paystack" });
  }

  let result;
  try {
    result = await paystackResponse.json();
  } catch (error) {
    console.error("Paystack returned an invalid initialization response", error);
    return res.status(502).json({ message: "Could not start payment with Paystack" });
  }

  if (!paystackResponse.ok || result?.status !== true || !result?.data?.authorization_url) {
    console.error("Paystack transaction initialization failed", {
      status: paystackResponse.status,
      message: result?.message,
    });
    return res.status(502).json({ message: "Could not start payment with Paystack" });
  }

  return res.status(200).json({ authorizationUrl: result.data.authorization_url });
}
