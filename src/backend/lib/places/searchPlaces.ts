const TEXT_SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

export interface PlaceCandidate {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface TextSearchResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    location?: { latitude?: number; longitude?: number };
  }>;
}

/**
 * 指定地点の近くにあるカテゴリの候補を Google Places API (New) で検索する。
 * API キー未設定・外部 API の失敗は呼び出し側で予期しないエラーとして扱う。
 */
export async function searchPlaces(
  category: string,
  latitude: number,
  longitude: number,
  radius: number,
): Promise<PlaceCandidate[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const response = await fetch(TEXT_SEARCH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location",
    },
    body: JSON.stringify({
      textQuery: category,
      languageCode: "ja",
      pageSize: 20,
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Places API request failed: ${response.status}`);
  }

  const data = (await response.json()) as TextSearchResponse;

  return (data.places ?? []).flatMap((place) => {
    const placeId = place.id?.trim();
    const name = place.displayName?.text?.trim();
    const placeLatitude = place.location?.latitude;
    const placeLongitude = place.location?.longitude;

    if (
      !placeId ||
      !name ||
      typeof placeLatitude !== "number" ||
      !Number.isFinite(placeLatitude) ||
      typeof placeLongitude !== "number" ||
      !Number.isFinite(placeLongitude)
    ) {
      return [];
    }

    return [{ placeId, name, latitude: placeLatitude, longitude: placeLongitude }];
  });
}
