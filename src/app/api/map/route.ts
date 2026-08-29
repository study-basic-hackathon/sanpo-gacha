import { NextResponse } from "next/server";

function coordinate(value: string | null, minimum: number, maximum: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? number
    : null;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originLatitude = coordinate(searchParams.get("originLat"), -90, 90);
  const originLongitude = coordinate(searchParams.get("originLng"), -180, 180);
  const destinationLatitude = coordinate(searchParams.get("destinationLat"), -90, 90);
  const destinationLongitude = coordinate(searchParams.get("destinationLng"), -180, 180);
  const apiKey =
    process.env.GOOGLE_MAPS_EMBED_API_KEY?.trim() ??
    process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (
    originLatitude === null ||
    originLongitude === null ||
    destinationLatitude === null ||
    destinationLongitude === null ||
    !apiKey
  ) {
    return NextResponse.json({ message: "map_unavailable" }, { status: 400 });
  }

  const mapUrl = new URL("https://www.google.com/maps/embed/v1/directions");
  mapUrl.searchParams.set("key", apiKey);
  mapUrl.searchParams.set("origin", `${originLatitude},${originLongitude}`);
  mapUrl.searchParams.set(
    "destination",
    `${destinationLatitude},${destinationLongitude}`,
  );
  mapUrl.searchParams.set("mode", "walking");
  mapUrl.searchParams.set("language", "ja");

  return NextResponse.redirect(mapUrl);
}
