import { AppError } from "./core.js";
/** Never propagate response text, request URLs, headers, tokens or native exception messages. */
export async function requestJson(
  url: URL | string,
  init: RequestInit,
  timeoutMs: number,
  auth = false,
): Promise<unknown> {
  try {
    const response = await fetch(url, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new AppError(
        auth || [401, 403].includes(response.status) ? "AUTH" : "API",
        auth ? "OAuth request rejected" : "API request failed",
        response.status,
      );
    }
    // Bound body size as well as time; reject untrusted server payloads before parsing.
    const reader = response.body?.getReader();
    if (!reader) throw new AppError(auth ? "AUTH" : "API", "Empty response");
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2_000_000) {
        await reader.cancel();
        throw new AppError(
          auth ? "AUTH" : "API",
          "Response exceeds size limit",
        );
      }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new AppError(auth ? "AUTH" : "API", "Response is not valid JSON");
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("NETWORK", "Request failed or timed out");
  }
}
export function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
