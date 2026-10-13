import { createHash } from "node:crypto";
import { redisCommand } from "./upstashRedis.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  if (typeof email !== "string" || email.length > 254) {
    throw new Error("A valid purchaser email is required");
  }
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error("A valid purchaser email is required");
  }
  return normalized;
}

function purchaserKey(email) {
  const emailHash = createHash("sha256").update(normalizeEmail(email)).digest("hex");
  return `lms:purchaser:${emailHash}`;
}

export async function storeCoursePurchase(purchase) {
  const email = normalizeEmail(purchase.email);
  if (
    typeof purchase.reference !== "string" ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(purchase.reference) ||
    typeof purchase.packageId !== "string" ||
    typeof purchase.packageName !== "string" ||
    !Array.isArray(purchase.addOnIds) ||
    !purchase.addOnIds.every(
      (addOnId) => typeof addOnId === "string" && /^[a-z0-9-]+$/.test(addOnId),
    ) ||
    !Array.isArray(purchase.includedItems) ||
    !purchase.includedItems.every((item) => typeof item === "string") ||
    !Number.isInteger(purchase.amountPesewas) ||
    purchase.amountPesewas < 1
  ) {
    throw new Error("Invalid verified course purchase");
  }

  const record = {
    email,
    packageId: purchase.packageId,
    packageName: purchase.packageName,
    addOnIds: purchase.addOnIds,
    includedItems: purchase.includedItems,
    amountPesewas: purchase.amountPesewas,
    currency: "GHS",
    reference: purchase.reference,
    purchasedAt: purchase.purchasedAt || new Date().toISOString(),
  };

  await redisCommand(
    "HSET",
    purchaserKey(email),
    purchase.reference,
    JSON.stringify(record),
  );

  return record;
}

export async function getCoursePurchases(email) {
  const result = await redisCommand("HGETALL", purchaserKey(email));
  if (!result) return [];

  const values = Array.isArray(result)
    ? result.filter((_, index) => index % 2 === 1)
    : Object.values(result);

  return values.map((value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error("Stored LMS purchase record is invalid", { cause: error });
    }
  });
}

export async function incrementLoginAttempts(identifier) {
  const identifierHash = createHash("sha256")
    .update(String(identifier || "unknown"))
    .digest("hex");
  const key = `lms:login-attempts:${identifierHash}`;
  const attempts = await redisCommand("INCR", key);

  if (attempts === 1) {
    await redisCommand("EXPIRE", key, 900);
  }

  return attempts;
}
