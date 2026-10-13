import { env } from "node:process";

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

export async function redisCommand(...command) {
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
