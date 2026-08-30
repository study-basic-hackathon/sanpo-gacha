"use client";

import { useEffect, useRef, useState } from "react";

type Location = { latitude: number; longitude: number };
type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds) => void;
  panTo: (position: GoogleLatLngLiteral) => void;
};
type GooglePolyline = { setMap: (map: GoogleMap | null) => void };
type GoogleMarker = { position: GoogleLatLngLiteral };
type GoogleLatLngLiteral = { lat: number; lng: number };
type GoogleLatLngBounds = { extend: (position: GoogleLatLngLiteral) => void };

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: { center: GoogleLatLngLiteral; zoom: number; mapId: string; disableDefaultUI: boolean; zoomControl: boolean }) => GoogleMap;
        Marker: new (options: { map: GoogleMap; position: GoogleLatLngLiteral; title: string; icon?: { path: number; scale: number; fillColor: string; fillOpacity: number; strokeColor: string; strokeWeight: number } }) => GoogleMarker;
        Polyline: new (options: { map: GoogleMap; path: GoogleLatLngLiteral[]; strokeColor: string; strokeOpacity: number; strokeWeight: number }) => GooglePolyline;
        LatLngBounds: new () => GoogleLatLngBounds;
        SymbolPath: { CIRCLE: number };
      };
    };
  }
}

let mapsScript: Promise<void> | undefined;

function loadMapsScript(apiKey: string) {
  if (window.google?.maps) return Promise.resolve();
  if (mapsScript) return mapsScript;
  mapsScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("maps_script_failed"));
    document.head.append(script);
  });
  return mapsScript;
}

function toLatLng(location: Location): GoogleLatLngLiteral {
  return { lat: location.latitude, lng: location.longitude };
}

function distanceInMeters(a: Location, b: Location) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitude = toRadians(b.latitude - a.latitude);
  const longitude = toRadians(b.longitude - a.longitude);
  const value = Math.sin(latitude / 2) ** 2 + Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(longitude / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function decodePolyline(encoded: string): GoogleLatLngLiteral[] {
  const path: GoogleLatLngLiteral[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    latitude += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    longitude += result & 1 ? ~(result >> 1) : result >> 1;
    path.push({ lat: latitude / 1e5, lng: longitude / 1e5 });
  }
  return path;
}

export function LiveRouteMap({ currentLocation, destination }: { currentLocation: Location | null; destination: Location | null }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const currentMarkerRef = useRef<GoogleMarker | null>(null);
  const destinationMarkerRef = useRef<GoogleMarker | null>(null);
  const routeRef = useRef<GooglePolyline | null>(null);
  const lastRouteLocationRef = useRef<Location | null>(null);
  const lastRouteAtRef = useRef(0);
  const routeRequestIdRef = useRef(0);
  const initializedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  useEffect(() => {
    if (!apiKey || !mapId || !elementRef.current || initializedRef.current) return;
    initializedRef.current = true;
    void loadMapsScript(apiKey).then(() => {
      if (!elementRef.current || !window.google?.maps) return;
      const initial = currentLocation ? toLatLng(currentLocation) : { lat: 35.681236, lng: 139.767125 };
      mapRef.current = new window.google.maps.Map(elementRef.current, { center: initial, zoom: 16, mapId, disableDefaultUI: true, zoomControl: true });
      setMapReady(true);
    }).catch(() => setError("地図の読み込みに失敗しました。"));
  }, [apiKey, currentLocation, mapId]);

  useEffect(() => {
    if (!mapRef.current || !currentLocation || !window.google?.maps) return;
    const position = toLatLng(currentLocation);
    if (currentMarkerRef.current) currentMarkerRef.current.position = position;
    else currentMarkerRef.current = new window.google.maps.Marker({ map: mapRef.current, position, title: "現在地", icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#2563eb", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 } });
  }, [currentLocation, mapReady]);

  useEffect(() => {
    if (!mapRef.current || !destination || !window.google?.maps) return;
    const position = toLatLng(destination);
    if (destinationMarkerRef.current) destinationMarkerRef.current.position = position;
    else destinationMarkerRef.current = new window.google.maps.Marker({ map: mapRef.current, position, title: "目的地" });
  }, [destination, mapReady]);

  useEffect(() => {
    if (!currentLocation || !destination || !mapRef.current || !window.google?.maps) return;
    const moved = lastRouteLocationRef.current ? distanceInMeters(lastRouteLocationRef.current, currentLocation) : Infinity;
    if (moved < 25 || Date.now() - lastRouteAtRef.current < 15_000) return;
    const requestId = ++routeRequestIdRef.current;
    void fetch("/api/map", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ origin: currentLocation, destination }) })
      .then(async (response) => response.ok ? response.json() as Promise<{ encodedPolyline: string }> : Promise.reject(new Error("route_failed")))
      .then(({ encodedPolyline }) => {
        if (requestId !== routeRequestIdRef.current || !mapRef.current || !window.google?.maps) return;
        const path = decodePolyline(encodedPolyline);
        routeRef.current?.setMap(null);
        routeRef.current = new window.google.maps.Polyline({ map: mapRef.current, path, strokeColor: "#285c3d", strokeOpacity: 0.85, strokeWeight: 6 });
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((point) => bounds.extend(point));
        mapRef.current.fitBounds(bounds);
        lastRouteLocationRef.current = currentLocation;
        lastRouteAtRef.current = Date.now();
        setError(null);
      })
      .catch(() => { if (requestId === routeRequestIdRef.current) setError("経路を取得できませんでした。") });
  }, [currentLocation, destination, mapReady]);

  if (!apiKey || !mapId) return <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-[#66736b]">Google Maps の API キーと Map ID が設定されていません。</p>;
  return <><div ref={elementRef} className="absolute inset-0" aria-label="現在地から目的地までの徒歩ルート" />{error && <p role="alert" className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-3 py-2 text-sm text-[#9b3834] shadow">{error}</p>}</>;
}
