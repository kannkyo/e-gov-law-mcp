const BASE_URL = "https://laws.e-gov.go.jp/api/2";
const TIMEOUT_MS = 30_000;

export class EGovApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string, url: string) {
    super(`e-Gov API error ${status} for ${url}: ${body}`);
    this.name = "EGovApiError";
    this.status = status;
    this.body = body;
  }
}

export class EGovTimeoutError extends Error {
  constructor(url: string) {
    super(`Request to ${url} timed out after ${TIMEOUT_MS}ms`);
    this.name = "EGovTimeoutError";
  }
}

type QueryParams = Record<string, string | number | undefined>;

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new EGovTimeoutError(url);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson(path: string, params?: QueryParams): Promise<unknown> {
  const url = buildUrl(path, params);
  const res = await fetchWithTimeout(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    throw new EGovApiError(res.status, body, url);
  }
  return res.json();
}

export async function fetchBinary(
  path: string,
  params?: QueryParams,
): Promise<{ buffer: Buffer; contentType: string }> {
  const url = buildUrl(path, params);
  const res = await fetchWithTimeout(url, {});
  if (!res.ok) {
    const body = await res.text();
    throw new EGovApiError(res.status, body, url);
  }
  const arrayBuffer = await res.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
  };
}
