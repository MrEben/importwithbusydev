import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";

export function createSessionSignature(value, secret) {
  return createHmac("sha256", secret).update(value).digest();
}

export function getSessionEmail(req, secret) {
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader !== "string") return null;

  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("busydev_lms_session="));
  if (!sessionCookie) return null;

  const token = sessionCookie.slice("busydev_lms_session=".length);
  const [payload, encodedSignature, extra] = token.split(".");
  if (!payload || !encodedSignature || extra) return null;

  let receivedSignature;
  let session;
  try {
    receivedSignature = Buffer.from(encodedSignature, "base64url");
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const expectedSignature = createSessionSignature(payload, secret);
  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature) ||
    typeof session.email !== "string" ||
    typeof session.expiresAt !== "number" ||
    session.expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return session.email;
}
