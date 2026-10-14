import { env } from "node:process";
import { getSessionEmail } from "../lib/server/lmsSession.js";
import { getCoursePurchases } from "../lib/server/lmsPurchases.js";
import { COURSE_ADD_ONS } from "../src/data/course-offers.js";

const DEFAULT_SITE_URL = "https://importwithbusydev.vercel.app";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Vary", "Cookie");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const sessionSecret = env.LMS_SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    console.error("LMS_SESSION_SECRET must be configured with at least 32 characters");
    return res.status(500).json({ message: "LMS authentication is not configured" });
  }
  const email = getSessionEmail(req, sessionSecret);
  if (!email) {
    return res.status(401).json({ message: "Sign in to your LMS account before purchasing an add-on" });
  }

  const addOnId = req.body?.addOnId;
  const addOn = COURSE_ADD_ONS.find((candidate) => candidate.id === addOnId);
  if (!addOn) {
    return res.status(400).json({ message: "Select a valid course add-on" });
  }

  let purchases;
  try {
    purchases = await getCoursePurchases(email);
  } catch (error) {
    console.error("Unable to look up LMS purchaser before add-on payment", error);
    return res.status(503).json({ message: "Could not verify your course account" });
  }
  if (purchases.length === 0) {
    return res.status(403).json({ message: "No existing course purchase was found for this LMS account" });
  }

  const purchasedAddOnIds = new Set(purchases.flatMap((purchase) => purchase.addOnIds ?? []));
  if (purchasedAddOnIds.has(addOn.id)) {
    return res.status(409).json({ message: "This add-on is already included in your account" });
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
        amount: addOn.priceGhs * 100,
        currency: "GHS",
        callback_url: new URL("/lms?addonPayment=1", env.SITE_URL || DEFAULT_SITE_URL).toString(),
        metadata: {
          purchase_type: "lms_addon",
          add_on_id: addOn.id,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error("Unable to initialize Paystack add-on transaction", error);
    return res.status(502).json({ message: "Could not start add-on payment with Paystack" });
  }

  let result;
  try {
    result = await paystackResponse.json();
  } catch (error) {
    console.error("Paystack returned an invalid add-on initialization response", error);
    return res.status(502).json({ message: "Could not start add-on payment with Paystack" });
  }

  if (!paystackResponse.ok || result?.status !== true || !result?.data?.authorization_url) {
    console.error("Paystack add-on transaction initialization failed", {
      status: paystackResponse.status,
      message: result?.message,
    });
    return res.status(502).json({ message: "Could not start add-on payment with Paystack" });
  }

  return res.status(200).json({ authorizationUrl: result.data.authorization_url });
}
