import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "node:process";
import {
  getCoursePurchases,
  incrementLoginAttempts,
} from "../lib/server/lmsPurchases.js";

const SESSION_COOKIE = "busydev_lms_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setNoStoreHeaders(res) {
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Vary", "Cookie");
}

function createSignature(value, secret) {
  return createHmac("sha256", secret).update(value).digest();
}

function createSessionToken(email, secret) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }),
  ).toString("base64url");
  const signature = createSignature(payload, secret).toString("base64url");
  return `${payload}.${signature}`;
}

function getSessionEmail(req, secret) {
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader !== "string") return null;

  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!sessionCookie) return null;

  const token = sessionCookie.slice(SESSION_COOKIE.length + 1);
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

  const expectedSignature = createSignature(payload, secret);
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

function setSessionCookie(res, token, maxAge = SESSION_TTL_SECONDS) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
  );
}

function getClientIdentifier(req) {
  const forwardedAddress = req.headers["x-real-ip"];
  const address =
    typeof forwardedAddress === "string"
      ? forwardedAddress
      : req.socket?.remoteAddress;
  return address || "unknown";
}

function passwordsMatch(inputPassword, configuredPassword, secret) {
  const inputDigest = createSignature(inputPassword, secret);
  const configuredDigest = createSignature(configuredPassword, secret);
  return timingSafeEqual(inputDigest, configuredDigest);
}

export default async function handler(req, res) {
  setNoStoreHeaders(res);

  const sessionSecret = env.LMS_SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    console.error("LMS_SESSION_SECRET must be configured with at least 32 characters");
    return res.status(500).json({ message: "LMS authentication is not configured" });
  }

  if (req.method === "GET") {
    const email = getSessionEmail(req, sessionSecret);
    if (!email) return res.status(200).json({ authenticated: false });

    try {
      const purchases = await getCoursePurchases(email);
      if (purchases.length === 0) {
        setSessionCookie(res, "", 0);
        return res.status(200).json({ authenticated: false });
      }

      return res.status(200).json({
        authenticated: true,
        email,
        packages: purchases.map(({ packageId, packageName }) => ({
          packageId,
          packageName,
        })),
      });
    } catch (error) {
      console.error("Unable to validate LMS session", error);
      return res.status(503).json({ message: "Could not validate your LMS session" });
    }
  }

  if (req.method === "DELETE") {
    setSessionCookie(res, "", 0);
    return res.status(200).json({ authenticated: false });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const sharedPassword = env.LMS_SHARED_PASSWORD;
  if (!sharedPassword) {
    console.error("LMS_SHARED_PASSWORD is not configured");
    return res.status(500).json({ message: "LMS authentication is not configured" });
  }

  const emailInput = req.body?.email;
  const passwordInput = req.body?.password;
  if (
    typeof emailInput !== "string" ||
    emailInput.length > 254 ||
    !EMAIL_PATTERN.test(emailInput.trim()) ||
    typeof passwordInput !== "string" ||
    passwordInput.length === 0 ||
    passwordInput.length > 1024
  ) {
    return res.status(400).json({ message: "Enter your purchase email and course password" });
  }

  let attempts;
  try {
    attempts = await incrementLoginAttempts(getClientIdentifier(req));
  } catch (error) {
    console.error("Unable to check LMS login rate limit", error);
    return res.status(503).json({ message: "Login is temporarily unavailable" });
  }

  if (attempts > 10) {
    return res.status(429).json({
      message: "Too many login attempts. Please wait 15 minutes and try again.",
    });
  }

  const email = emailInput.trim().toLowerCase();
  const validPassword = passwordsMatch(passwordInput, sharedPassword, sessionSecret);
  if (!validPassword) {
    return res.status(401).json({
      message: "We could not verify this email and password with a course purchase.",
    });
  }

  let purchases;
  try {
    purchases = await getCoursePurchases(email);
  } catch (error) {
    console.error("Unable to look up LMS purchaser", error);
    return res.status(503).json({ message: "Could not verify your course purchase" });
  }

  if (purchases.length === 0) {
    return res.status(401).json({
      message: "We could not verify this email and password with a course purchase.",
    });
  }

  setSessionCookie(res, createSessionToken(email, sessionSecret));
  return res.status(200).json({
    authenticated: true,
    email,
    packages: purchases.map(({ packageId, packageName }) => ({
      packageId,
      packageName,
    })),
  });
}
