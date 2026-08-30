"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation } from "@/frontend/contexts/LocationContext";
import { loadSearchStrollResults, type SearchStrollCandidate } from "@/frontend/utils/searchStrollResults";
import { ensureStrollStartedAt, finalizeStroll, recordStrollLocation } from "@/frontend/utils/strollProgress";
import { LiveRouteMap } from "@/components/stroll/LiveRouteMap";

const EARTH_RADIUS_METERS = 6_371_000;

function distanceInMeters(a: number, b: number, c: number, d: number) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(c - a);
  const longitudeDelta = radians(d - b);
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(a)) * Math.cos(radians(c)) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export default function StrollPage() {
  const router = useRouter();
  const { location, setCurrentLocation } = useLocation();
  const destination = useSyncExternalStore<SearchStrollCandidate | null>(
    () => () => {},
    () => loadSearchStrollResults()[0] ?? null,
    () => null,
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startedAt = ensureStrollStartedAt();
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1_000)), 1_000);
    if (!navigator.geolocation) return () => window.clearInterval(timer);
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const currentLocation = { latitude: coords.latitude, longitude: coords.longitude };
        setCurrentLocation(currentLocation);
        recordStrollLocation(currentLocation);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 10_000 },
    );
    return () => { window.clearInterval(timer); navigator.geolocation.clearWatch(watchId); };
  }, [setCurrentLocation]);

  const remainingMeter = destination && location
    ? Math.round(distanceInMeters(location.latitude, location.longitude, destination.latitude, destination.longitude))
    : destination?.meter ?? 0;
  const progress = destination && destination.meter > 0
    ? Math.min(100, Math.max(0, ((destination.meter - remainingMeter) / destination.meter) * 100))
    : 0;

  function finishStroll() {
    finalizeStroll();
    router.push("/stroll/result");
  }

  return <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
    <header className="border-b border-[#b7c2b9] bg-white"><div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10"><Link href="/" className="flex items-center gap-2.5"><Image src="/sanpo-gacha-logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" priority /><span className="text-xl font-bold tracking-wide text-[#285c3d]">さんぽガチャ</span></Link><p className="text-sm font-semibold text-[#53675a]">散歩中：{destination?.name ?? "目的地未設定"}</p></div></header>
    <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="relative min-h-[620px] overflow-hidden border-r border-[#cbd5cd] bg-[#e8efe2]">
        <LiveRouteMap currentLocation={location} destination={destination ? { latitude: destination.latitude, longitude: destination.longitude } : null} />
      </section>
      <aside className="bg-white px-7 py-9"><p className="text-xs font-semibold tracking-[0.18em] text-[#719078]">NOW WALKING</p><h1 className="mt-2 text-2xl font-bold text-[#24483a]">散歩中</h1><div className="mt-8"><p className="text-sm text-[#758178]">目的地</p><p className="mt-3 text-lg font-bold">{destination?.name ?? "目的地を選択してください"}へ</p></div><div className="mt-8 grid grid-cols-2 gap-3"><Metric label="残り距離" value={`約${(remainingMeter / 1000).toFixed(1)} km`} /><Metric label="経過時間" value={`${Math.floor(elapsedSeconds / 60)}分${String(elapsedSeconds % 60).padStart(2, "0")}秒`} /></div><div className="mt-8"><div className="flex justify-between text-xs text-[#748078]"><span>現在位置</span><span>目的地</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dce5de]"><div className="h-full rounded-full bg-[#3c7d55] transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-right text-xs text-[#748078]">約{Math.round(progress)}%進みました</p></div><div className="mt-8 rounded-2xl bg-[#fff8e9] p-4 text-sm leading-6 text-[#745e34]">地図を見るときは、安全な場所で立ち止まりましょう。</div>{/* 写真機能はAPIが未対応のため、準備中として無効にしている。 */}<span title="準備中の機能です" aria-disabled="true" className="mt-8 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[#dbe2dc] bg-white font-semibold text-[#9aa79d]">📷 写真を撮る<span className="rounded-full bg-[#f1f4f1] px-2 py-0.5 text-[10px] font-semibold">準備中</span></span><button type="button" onClick={finishStroll} className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-[#c98782] bg-white font-semibold text-[#9b3834]">散歩を終了する</button></aside>
    </div>
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#f3f7f3] p-4"><p className="text-xs text-[#77837b]">{label}</p><p className="mt-2 text-lg font-bold text-[#2f6544]">{value}</p></div>; }
