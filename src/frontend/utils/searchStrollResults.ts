import type { SearchStrollResponse } from "@/frontend/api/searchStroll";

const STORAGE_KEY = "search-stroll-results";
let cachedValue: string | null | undefined;
let cachedResults: SearchStrollCandidate[] = [];

export type SearchStrollCandidate = SearchStrollResponse & { category: string };

export function saveSearchStrollResults(results: SearchStrollCandidate[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function loadSearchStrollResults(): SearchStrollCandidate[] {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);

    if (value === cachedValue) {
      return cachedResults;
    }

    cachedValue = value;
    const stored = JSON.parse(value ?? "[]") as unknown;

    if (!Array.isArray(stored)) {
      cachedResults = [];
      return cachedResults;
    }

    cachedResults = stored.filter(isSearchStrollCandidate);
    return cachedResults;
  } catch {
    cachedValue = undefined;
    cachedResults = [];
    return cachedResults;
  }
}

function isSearchStrollCandidate(value: unknown): value is SearchStrollCandidate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.placeId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.meter === "number" &&
    Number.isFinite(candidate.meter) &&
    typeof candidate.scheduledTime === "number" &&
    Number.isFinite(candidate.scheduledTime)
  );
}
