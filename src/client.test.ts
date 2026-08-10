import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchJson, fetchBinary, EGovApiError, EGovTimeoutError } from "./client.js";

describe("fetchJson", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the correct URL with query params and returns parsed JSON", async () => {
    const mockJson = { law_id: "123" };
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockJson,
    });

    const result = await fetchJson("/laws", { law_title: "民法", limit: 10 });

    expect(fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toBe("https://laws.e-gov.go.jp/api/2/laws?law_title=%E6%B0%91%E6%B3%95&limit=10");
    const calledInit = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect((calledInit.headers as Record<string, string>).Accept).toBe("application/json");
    expect(result).toEqual(mockJson);
  });

  it("omits undefined params from the query string", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({}),
    });

    await fetchJson("/laws", { law_title: "民法", limit: undefined });

    const calledUrl = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toBe("https://laws.e-gov.go.jp/api/2/laws?law_title=%E6%B0%91%E6%B3%95");
  });

  it("throws EGovApiError with status and body on non-ok response", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
      text: async () => "law not found",
    });

    await expect(fetchJson("/laws", {})).rejects.toMatchObject({
      status: 404,
      body: "law not found",
    });
    await expect(fetchJson("/laws", {})).rejects.toBeInstanceOf(EGovApiError);
  });

  it("throws EGovTimeoutError when fetch aborts", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    await expect(fetchJson("/laws", {})).rejects.toBeInstanceOf(EGovTimeoutError);
  });
});

describe("fetchBinary", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a Buffer and content-type on success", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/pdf" }),
      arrayBuffer: async () => bytes.buffer,
    });

    const result = await fetchBinary("/attachment/123", {});

    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.equals(Buffer.from(bytes))).toBe(true);
    expect(result.contentType).toBe("application/pdf");
  });
});
