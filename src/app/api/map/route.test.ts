import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/map/route";

const originalApiKey = process.env.GOOGLE_ROUTES_API_KEY;

function request(body: unknown) {
  return new Request("http://localhost/api/map", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalApiKey === undefined) delete process.env.GOOGLE_ROUTES_API_KEY;
  else process.env.GOOGLE_ROUTES_API_KEY = originalApiKey;
});

describe("POST /api/map", () => {
  it("Routes API の徒歩経路をエンコード済みポリラインで返す", async () => {
    process.env.GOOGLE_ROUTES_API_KEY = "routes-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ routes: [{ polyline: { encodedPolyline: "abc" } }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({ origin: { latitude: 35.681236, longitude: 139.767125 }, destination: { latitude: 35.689634, longitude: 139.692101 } }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ encodedPolyline: "abc" });
    expect(fetchMock).toHaveBeenCalledWith("https://routes.googleapis.com/directions/v2:computeRoutes", expect.objectContaining({ headers: expect.objectContaining({ "x-goog-api-key": "routes-key", "x-goog-fieldmask": "routes.polyline.encodedPolyline" }) }));
  });

  it("座標または Routes API キーが不正なら400を返す", async () => {
    delete process.env.GOOGLE_ROUTES_API_KEY;
    const response = await POST(request({ origin: { latitude: 100, longitude: 139 }, destination: { latitude: 35, longitude: 139 } }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "map_unavailable" });
  });
});
