"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CurrentLocation {
  latitude: number;
  longitude: number;
}

interface LocationContextValue {
  location: CurrentLocation | null;
  setCurrentLocation: (location: CurrentLocation) => void;
  requestCurrentLocation: () => Promise<CurrentLocation>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<CurrentLocation | null>(null);

  const value = useMemo<LocationContextValue>(
    () => ({
      location,
      setCurrentLocation: setLocation,
      requestCurrentLocation: () =>
        new Promise<CurrentLocation>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("このブラウザでは現在地を取得できません。"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const currentLocation = {
                latitude: coords.latitude,
                longitude: coords.longitude,
              };
              setLocation(currentLocation);
              resolve(currentLocation);
            },
            () =>
              reject(
                new Error(
                  "現在地を取得できませんでした。位置情報の利用を許可してください。",
                ),
              ),
            { enableHighAccuracy: true, timeout: 10_000 },
          );
        }),
    }),
    [location],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  return context;
}
