import { createHash } from "node:crypto";
import { env } from "node:process";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRedisConfig() {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis is not configured");
  }

  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:") {
    throw new Error("Upstash Redis URL must use HTTPS");
  }

  return { url: parsedUrl.origin, token };
}

async function redisCommand(...command) {
  const { url, token } = getRedisConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(5000),
  });

  let result;
  try {
    result = await response.json();
  } catch (error) {
    throw new Error("Upstash Redis returned an invalid response", { cause: error });
  }

  if (!response.ok || result?.error) {
    throw new Error("Upstash Redis request failed");
  }

  return result?.result;
}

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
    !Number.isInteger(purchase.amountPesewas) ||
    purchase.amountPesewas < 1
  ) {
    throw new Error("Invalid verified course purchase");
  }

  const record = {
    email,
    packageId: purchase.packageId,
    packageName: purchase.packageName,
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
