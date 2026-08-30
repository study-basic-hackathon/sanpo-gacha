import { NextResponse } from "next/server";

function coordinate(value: string | null, minimum: number, maximum: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? number
    : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { origin?: { latitude?: number; longitude?: number }; destination?: { latitude?: number; longitude?: number } } | null;
  const originLatitude = coordinate(String(body?.origin?.latitude), -90, 90);
  const originLongitude = coordinate(String(body?.origin?.longitude), -180, 180);
  const destinationLatitude = coordinate(String(body?.destination?.latitude), -90, 90);
  const destinationLongitude = coordinate(String(body?.destination?.longitude), -180, 180);
  const apiKey = process.env.GOOGLE_ROUTES_API_KEY?.trim();
  if (originLatitude === null || originLongitude === null || destinationLatitude === null || destinationLongitude === null || !apiKey) return NextResponse.json({ message: "map_unavailable" }, { status: 400 });
  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey, "x-goog-fieldmask": "routes.polyline.encodedPolyline" }, body: JSON.stringify({ origin: { location: { latLng: { latitude: originLatitude, longitude: originLongitude } } }, destination: { location: { latLng: { latitude: destinationLatitude, longitude: destinationLongitude } } }, travelMode: "WALK", languageCode: "ja" }), cache: "no-store" });
  const result = await response.json().catch(() => null) as { routes?: Array<{ polyline?: { encodedPolyline?: string } }> } | null;
  const encodedPolyline = result?.routes?.[0]?.polyline?.encodedPolyline;
  if (!response.ok || !encodedPolyline) return NextResponse.json({ message: "route_unavailable" }, { status: 502 });
  return NextResponse.json({ encodedPolyline });
}
