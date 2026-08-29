const STARTED_AT_KEY = "stroll-started-at";
const METER_KEY = "stroll-meter";
const LAST_LOCATION_KEY = "stroll-last-location";
const FINAL_SUMMARY_KEY = "stroll-final-summary";

interface StoredLocation {
  latitude: number;
  longitude: number;
}

export interface StrollSummary {
  elapsedSeconds: number;
  meter: number;
}

export function ensureStrollStartedAt(): number {
  const existing = Number(sessionStorage.getItem(STARTED_AT_KEY));

  if (Number.isFinite(existing) && existing > 0) {
    return existing;
  }

  const startedAt = Date.now();
  sessionStorage.setItem(STARTED_AT_KEY, String(startedAt));
  return startedAt;
}

export function startNewStroll(): void {
  sessionStorage.setItem(STARTED_AT_KEY, String(Date.now()));
  sessionStorage.setItem(METER_KEY, "0");
  sessionStorage.removeItem(LAST_LOCATION_KEY);
  sessionStorage.removeItem(FINAL_SUMMARY_KEY);
}

export function recordStrollLocation(location: StoredLocation): void {
  const previous = parseLocation(sessionStorage.getItem(LAST_LOCATION_KEY));
  const meter = Number(sessionStorage.getItem(METER_KEY)) || 0;
  const addedMeter = previous
    ? distanceInMeters(
        previous.latitude,
        previous.longitude,
        location.latitude,
        location.longitude,
      )
    : 0;

  sessionStorage.setItem(METER_KEY, String(meter + addedMeter));
  sessionStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
}

export function finalizeStroll(): StrollSummary {
  const summary = {
    elapsedSeconds: getStrollElapsedSeconds(),
    meter: Math.round(Number(sessionStorage.getItem(METER_KEY)) || 0),
  };
  sessionStorage.setItem(FINAL_SUMMARY_KEY, JSON.stringify(summary));
  return summary;
}

export function getFinalStrollSummary(): StrollSummary {
  try {
    const summary = JSON.parse(sessionStorage.getItem(FINAL_SUMMARY_KEY) ?? "") as StrollSummary;
    if (Number.isFinite(summary.elapsedSeconds) && Number.isFinite(summary.meter)) {
      return summary;
    }
  } catch {}

  return finalizeStroll();
}

export function getStrollElapsedSeconds(): number {
  const startedAt = Number(sessionStorage.getItem(STARTED_AT_KEY));

  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - startedAt) / 1_000));
}

function parseLocation(value: string | null): StoredLocation | null {
  try {
    const location = JSON.parse(value ?? "") as StoredLocation;
    return Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
      ? location
      : null;
  } catch {
    return null;
  }
}

function distanceInMeters(a: number, b: number, c: number, d: number): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(c - a);
  const longitudeDelta = radians(d - b);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(a)) * Math.cos(radians(c)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
