import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "node:process";
import { COURSE_ADD_ONS, COURSE_PACKAGES, getCoursePackage } from "../src/data/course-offers.js";
import {
  storeCourseAddonPurchase,
  storeCoursePurchase,
} from "../lib/server/lmsPurchases.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_BODY_BYTES = 1024 * 1024;

async function readRawBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      return null;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const secret = env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return res.status(500).json({ message: "Webhook is not configured" });
  }

  const rawBody = await readRawBody(req);
  if (!rawBody) {
    return res.status(413).json({ message: "Request body is too large" });
  }

  const signature = req.headers["x-paystack-signature"];
  if (typeof signature !== "string" || !/^[a-f\d]{128}$/i.test(signature)) {
    return res.status(401).json({ message: "Unauthorized: Invalid signature" });
  }

  const expectedSignature = createHmac("sha512", secret).update(rawBody).digest();
  const receivedSignature = Buffer.from(signature, "hex");
  if (!timingSafeEqual(expectedSignature, receivedSignature)) {
    return res.status(401).json({ message: "Unauthorized: Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return res.status(400).json({ message: "Invalid event payload" });
  }

  if (event.event === "charge.success") {
    const payment = event.data ?? {};
    const { reference, amount, currency } = payment;
    console.info("Paystack charge succeeded", { reference, amount, currency });

    const coursePackage = COURSE_PACKAGES.find(
      (candidate) => candidate.amountPesewas === amount,
    );
    const addOn = event.data?.metadata?.purchase_type === "lms_addon"
      ? COURSE_ADD_ONS.find(
          (candidate) => candidate.id === event.data.metadata.add_on_id,
        )
      : null;
    if (
      payment.status === "success" &&
      currency === "GHS" &&
      typeof reference === "string" &&
      addOn &&
      amount === addOn.priceGhs * 100
    ) {
      try {
        await storeCourseAddonPurchase({
          email: payment.customer?.email,
          reference,
          addOnId: addOn.id,
          amountPesewas: amount,
          purchasedAt: payment.paid_at,
        });
      } catch (error) {
        console.error("Unable to update LMS account for verified add-on payment", error);
        return res.status(503).json({ message: "Could not update existing course purchase" });
      }
      return res.status(200).json({ status: "success" });
    }

    if (
      payment.status === "success" &&
      currency === "GHS" &&
      typeof reference === "string" &&
      coursePackage
    ) {
      const selectedPackage = getCoursePackage(coursePackage.addOnIds);
      const includedItems = [
        "Complete Importation Masterclass",
        ...coursePackage.addOnIds.map(
          (addOnId) =>
            COURSE_ADD_ONS.find((addOn) => addOn.id === addOnId)?.name ?? addOnId,
        ),
      ];

      try {
        await storeCoursePurchase({
          email: payment.customer?.email,
          reference,
          packageId: selectedPackage.id,
          packageName: includedItems.join(" + "),
          addOnIds: coursePackage.addOnIds,
          includedItems,
          amountPesewas: amount,
          purchasedAt: payment.paid_at,
        });
      } catch (error) {
        console.error("Unable to store verified course purchaser", error);
        return res.status(503).json({ message: "Could not record course purchase" });
      }

    }
  }

  return res.status(200).json({ status: "success" });
}
