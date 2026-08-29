import { prisma } from "@/backend/lib/db/prisma";
import { searchPlaces } from "@/backend/lib/places/searchPlaces";
import type { components } from "@/contracts/api";
import type { Result } from "@/backend/utils/Result";
import { fail, success } from "@/backend/utils/Result";

export type SearchStrollPayload = components["schemas"]["SearchStrollPayload"];
export type SearchStrollResponse = components["schemas"]["SearchStrollResponse"];

export const SEARCH_STROLL_ERROR = {
  invalidInput: "invalid_input",
  notFound: "not_found",
  unexpected: "unexpected_error_occurred",
} as const;

export type SearchStrollError =
  (typeof SEARCH_STROLL_ERROR)[keyof typeof SEARCH_STROLL_ERROR];

const WALKING_SPEED_METERS_PER_MINUTE = 80;
const DURATION_TOLERANCE_MINUTES = 5;
const EARTH_RADIUS_METERS = 6_371_000;
const MAX_PLACE_SEARCH_RADIUS_METERS = 50_000;

function parsePayload(payload: SearchStrollPayload) {
  const latitude = payload?.latitude;
  const longitude = payload?.longitude;
  const duration = payload?.duration;
  const categories =
    typeof payload?.categories === "string" ? payload.categories.trim() : "";
  const categoryQueries = categories
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    typeof duration !== "number" ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    categoryQueries.length === 0
  ) {
    return null;
  }

  return { latitude, longitude, duration, categoryQueries };
}

/** 2地点間の直線距離をメートルで返す（Haversine formula）。 */
function distanceInMeters(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLatitudeRadians = toRadians(fromLatitude);
  const toLatitudeRadians = toRadians(toLatitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchStroll(
  userId: string,
  payload: SearchStrollPayload,
): Promise<Result<SearchStrollResponse, SearchStrollError>> {
  const input = parsePayload(payload);

  if (!input) {
    return fail(SEARCH_STROLL_ERROR.invalidInput);
  }

  try {
    const visitedSince = new Date();
    visitedSince.setMonth(visitedSince.getMonth() - 1);

    // placeId だけを取得し、直近1か月に訪問した候補を除外する。
    const histories = await prisma.strollHistory.findMany({
      where: { userId, visitedAt: { gte: visitedSince } },
      select: { visitedPlaceId: true },
    });
    const visitedPlaceIds = new Set(histories.map(({ visitedPlaceId }) => visitedPlaceId));

    // 時間条件に収まる可能性がある範囲を検索の重み付けに使用する。
    const searchRadius = Math.min(
      (input.duration + DURATION_TOLERANCE_MINUTES) *
        WALKING_SPEED_METERS_PER_MINUTE,
      MAX_PLACE_SEARCH_RADIUS_METERS,
    );
    const candidates = (
      await Promise.all(
        input.categoryQueries.map((category) =>
          searchPlaces(category, input.latitude, input.longitude, searchRadius),
        ),
      )
    );
    const places = candidates.flat();
    const returnedPlaceIds = new Set<string>();

    const matched = places
      .flatMap((candidate) => {
        if (visitedPlaceIds.has(candidate.placeId) || returnedPlaceIds.has(candidate.placeId)) {
          return [];
        }
        returnedPlaceIds.add(candidate.placeId);

        const meter = Math.round(
          distanceInMeters(
            input.latitude,
            input.longitude,
            candidate.latitude,
            candidate.longitude,
          ),
        );
        const scheduledTime = Math.ceil(meter / WALKING_SPEED_METERS_PER_MINUTE);

        if (Math.abs(input.duration - scheduledTime) > DURATION_TOLERANCE_MINUTES) {
          return [];
        }

        return [
          {
            placeId: candidate.placeId,
            name: candidate.name,
            meter,
            scheduledTime,
            latitude: candidate.latitude,
            longitude: candidate.longitude,
          },
        ];
      })
        .sort(
          (left, right) =>
            Math.abs(left.scheduledTime - input.duration) -
              Math.abs(right.scheduledTime - input.duration) ||
            left.meter - right.meter,
        );

    if (matched.length === 0) {
      return fail(SEARCH_STROLL_ERROR.notFound);
    }

    return success(matched[0]);
  } catch {
    return fail(SEARCH_STROLL_ERROR.unexpected);
  }
}
