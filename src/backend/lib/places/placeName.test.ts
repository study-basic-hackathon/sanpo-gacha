import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const PLACE_ID = "ChIJ123456789";
const OTHER_PLACE_ID = "ChIJ987654321";
const API_KEY = "test-api-key";

/** モジュール内のキャッシュを毎回リセットするため、テストごとに読み込み直す。 */
async function importResolver() {
  vi.resetModules();

  return import("@/backend/lib/places/placeName");
}

function placeResponse(name: string) {
  return {
    ok: true,
    json: async () => ({ displayName: { text: name, languageCode: "ja" } }),
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GOOGLE_PLACES_API_KEY", API_KEY);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("resolvePlaceNames", () => {
  it("placeIdごとに解決した場所名を返す", async () => {
    const { resolvePlaceNames } = await importResolver();

    fetchMock
      .mockResolvedValueOnce(placeResponse("木場公園"))
      .mockResolvedValueOnce(placeResponse("富岡八幡宮"));

    const names = await resolvePlaceNames([PLACE_ID, OTHER_PLACE_ID]);

    expect(names.get(PLACE_ID)).toBe("木場公園");
    expect(names.get(OTHER_PLACE_ID)).toBe("富岡八幡宮");
  });

  it("Places APIへ日本語の表示名だけを要求する", async () => {
    const { resolvePlaceNames } = await importResolver();

    fetchMock.mockResolvedValue(placeResponse("木場公園"));

    await resolvePlaceNames([PLACE_ID]);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=ja`,
      {
        headers: {
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "displayName",
        },
      },
    );
  });

  it("同じplaceIdが重複していても取得は1回にする", async () => {
    const { resolvePlaceNames } = await importResolver();

    fetchMock.mockResolvedValue(placeResponse("木場公園"));

    await resolvePlaceNames([PLACE_ID, PLACE_ID]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("一度解決したplaceIdはキャッシュから返す", async () => {
    const { resolvePlaceNames } = await importResolver();

    fetchMock.mockResolvedValue(placeResponse("木場公園"));

    await resolvePlaceNames([PLACE_ID]);
    const names = await resolvePlaceNames([PLACE_ID]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(names.get(PLACE_ID)).toBe("木場公園");
  });

  it("APIキーが未設定の場合は取得せず空のMapを返す", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");

    const { resolvePlaceNames } = await importResolver();

    const names = await resolvePlaceNames([PLACE_ID]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(names.size).toBe(0);
  });

  it("空文字のplaceIdは取得対象にしない", async () => {
    const { resolvePlaceNames } = await importResolver();

    const names = await resolvePlaceNames([" "]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(names.size).toBe(0);
  });

  it("エラー応答のplaceIdは結果に含めない", async () => {
    const { resolvePlaceNames } = await importResolver();

    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });

    const names = await resolvePlaceNames([PLACE_ID]);

    expect(names.has(PLACE_ID)).toBe(false);
  });

  it("通信に失敗しても例外を投げず、解決できたものだけ返す", async () => {
    const { resolvePlaceNames } = await importResolver();

    fetchMock
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(placeResponse("富岡八幡宮"));

    const names = await resolvePlaceNames([PLACE_ID, OTHER_PLACE_ID]);

    expect(names.has(PLACE_ID)).toBe(false);
    expect(names.get(OTHER_PLACE_ID)).toBe("富岡八幡宮");
  });

  it("表示名を持たない応答は結果に含めない", async () => {
    const { resolvePlaceNames } = await importResolver();

    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    const names = await resolvePlaceNames([PLACE_ID]);

    expect(names.has(PLACE_ID)).toBe(false);
  });
});
