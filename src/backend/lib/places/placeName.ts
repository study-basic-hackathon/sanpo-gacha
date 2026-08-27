/** Google Places APIを使って、placeIdから目的地の名称を解決するモジュール。 */

const PLACE_DETAILS_ENDPOINT = "https://places.googleapis.com/v1/places";

// 同じplaceIdを繰り返し問い合わせないよう、解決できた名称をプロセス内に保持する。
const placeNameCache = new Map<string, string>();

interface PlaceDetailsResponse {
  displayName?: { text?: string };
}

/**
 * placeIdの一覧から、解決できた場所名だけを持つMapを返す。
 * APIキーが未設定の場合や取得に失敗した場合は、そのplaceIdを含めない。
 */
export async function resolvePlaceNames(
  placeIds: string[],
): Promise<Map<string, string>> {
  const resolved = new Map<string, string>();
  const targets = new Set<string>();

  for (const placeId of placeIds) {
    const id = typeof placeId === "string" ? placeId.trim() : "";

    if (!id) {
      continue;
    }

    const cached = placeNameCache.get(id);

    if (cached !== undefined) {
      resolved.set(id, cached);
      continue;
    }

    targets.add(id);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (!apiKey || targets.size === 0) {
    return resolved;
  }

  const fetched = await Promise.all(
    [...targets].map(async (id) => [id, await fetchPlaceName(id, apiKey)] as const),
  );

  for (const [id, name] of fetched) {
    if (!name) {
      continue;
    }

    placeNameCache.set(id, name);
    resolved.set(id, name);
  }

  return resolved;
}

/** 1件分の場所名を取得する。取得できない場合は空文字を返す。 */
async function fetchPlaceName(placeId: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `${PLACE_DETAILS_ENDPOINT}/${encodeURIComponent(placeId)}?languageCode=ja`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "displayName",
        },
      },
    );

    if (!response.ok) {
      return "";
    }

    const details = (await response.json()) as PlaceDetailsResponse;

    return details.displayName?.text?.trim() ?? "";
  } catch {
    // 名称は補助的な情報のため、通信エラーは握りつぶして未解決として扱う。
    return "";
  }
}
