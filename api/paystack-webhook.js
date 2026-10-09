import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "node:process";

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
    const { reference, amount, currency } = event.data ?? {};
    console.info("Paystack charge succeeded", { reference, amount, currency });
  }

  return res.status(200).json({ status: "success" });
}
