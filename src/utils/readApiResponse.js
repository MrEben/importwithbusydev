export async function readApiResponse(response, action) {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(
      `${action} returned an empty response (HTTP ${response.status}). Please retry. If this continues, the serverless function may not be deployed correctly.`,
    );
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(
      `${action} returned an invalid response (HTTP ${response.status}). Please retry. If this continues, check the serverless function deployment.`,
    );
  }
}
