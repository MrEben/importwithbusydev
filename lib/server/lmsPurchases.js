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

export async function storeCourseAddonPurchase(purchase) {
  const email = normalizeEmail(purchase.email);
  const addOn = COURSE_ADD_ONS.find((candidate) => candidate.id === purchase.addOnId);
  if (
    !addOn ||
    typeof purchase.reference !== "string" ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(purchase.reference) ||
    purchase.amountPesewas !== addOn.priceGhs * 100
  ) {
    throw new Error("Invalid verified course add-on purchase");
  }

  const script = `
    local records = redis.call("HGETALL", KEYS[1])
    if #records == 0 then
      return "missing_purchaser"
    end

    local targetField = nil
    local targetRecord = nil
    for index = 1, #records, 2 do
      local record = cjson.decode(records[index + 1])
      if not targetRecord and type(record.addOnIds) == "table" then
        targetField = records[index]
        targetRecord = record
      end
      for _, payment in ipairs(record.addOnPayments or {}) do
        if payment.reference == ARGV[1] then
          return "already_recorded"
        end
      end
    end

    if not targetRecord then
      return "missing_course_purchase"
    end

    targetRecord.addOnIds = targetRecord.addOnIds or {}
    local hasAddOn = false
    for _, addOnId in ipairs(targetRecord.addOnIds) do
      if addOnId == ARGV[2] then
        hasAddOn = true
        break
      end
    end
    if not hasAddOn then
      table.insert(targetRecord.addOnIds, ARGV[2])
    end

    local hasBlueprint = false
    local hasSupplierGuide = false
    for _, addOnId in ipairs(targetRecord.addOnIds) do
      if addOnId == "importers-blueprint" then
        hasBlueprint = true
      elseif addOnId == "supplier-communication" then
        hasSupplierGuide = true
      end
    end
    if hasBlueprint and hasSupplierGuide then
      targetRecord.packageId = "masterclass-both-guides"
    elseif hasBlueprint then
      targetRecord.packageId = "masterclass-blueprint"
    elseif hasSupplierGuide then
      targetRecord.packageId = "masterclass-supplier-guide"
    else
      targetRecord.packageId = "masterclass"
    end

    targetRecord.includedItems = targetRecord.includedItems or {"Complete Importation Masterclass"}
    local hasIncludedItem = false
    for _, item in ipairs(targetRecord.includedItems) do
      if item == ARGV[3] then
        hasIncludedItem = true
        break
      end
    end
    if not hasIncludedItem then
      table.insert(targetRecord.includedItems, ARGV[3])
    end
    targetRecord.packageName = table.concat(targetRecord.includedItems, " + ")
    targetRecord.addOnPayments = targetRecord.addOnPayments or {}
    table.insert(targetRecord.addOnPayments, {
      addOnId = ARGV[2],
      reference = ARGV[1],
      amountPesewas = tonumber(ARGV[4]),
      purchasedAt = ARGV[5]
    })

    redis.call("HSET", KEYS[1], targetField, cjson.encode(targetRecord))
    return "stored"
  `;
  const result = await redisCommand(
    "EVAL",
    script,
    1,
    purchaserKey(email),
    purchase.reference,
    addOn.id,
    addOn.name,
    purchase.amountPesewas,
    purchase.purchasedAt || new Date().toISOString(),
  );

  if (
    result !== "stored" &&
    result !== "already_recorded" &&
    result !== "missing_purchaser" &&
    result !== "missing_course_purchase"
  ) {
    throw new Error("Could not update the existing LMS course purchase");
  }
  if (result === "missing_purchaser" || result === "missing_course_purchase") {
    throw new Error("No existing LMS course purchase was found for this add-on payment");
  }

  return { email, addOnId: addOn.id, reference: purchase.reference };
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
