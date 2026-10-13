import { createHash } from "node:crypto";
import { redisCommand } from "./upstashRedis.js";
import { COURSE_ADD_ONS } from "../../src/data/course-offers.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADD_ON_DOWNLOADS_KEY = "lms:course:addon-downloads";

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

export async function getCourseAddonDownloads(purchasedAddOnIds) {
  const purchasedIds = new Set(purchasedAddOnIds);
  if (purchasedIds.size === 0) return {};

  const result = await redisCommand("HGETALL", ADD_ON_DOWNLOADS_KEY);
  if (!result) return {};

  const entries = Array.isArray(result)
    ? result.reduce((items, value, index, values) => {
        if (index % 2 === 0) items.push([value, values[index + 1]]);
        return items;
      }, [])
    : Object.entries(result);
  const validAddOnIds = new Set(COURSE_ADD_ONS.map((addOn) => addOn.id));

  return Object.fromEntries(
    entries.flatMap(([addOnId, value]) => {
      if (!validAddOnIds.has(addOnId) || !purchasedIds.has(addOnId)) return [];
      if (typeof value !== "string") {
        throw new Error(`Stored download link for ${addOnId} is invalid`);
      }

      let url;
      try {
        url = new URL(value);
      } catch (error) {
        throw new Error(`Stored download link for ${addOnId} is invalid`, {
          cause: error,
        });
      }
      if (url.protocol !== "https:") {
        throw new Error(`Stored download link for ${addOnId} must use HTTPS`);
      }

      return [[addOnId, url.href]];
    }),
  );
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
