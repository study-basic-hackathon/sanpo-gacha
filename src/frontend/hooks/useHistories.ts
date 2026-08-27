"use client";

import { useEffect, useState } from "react";
import {
  fetchHistories,
  type FetchHistoryError,
  type HistoryResponse,
} from "@/frontend/api/history";

export type HistoriesState =
  | { status: "loading" }
  | { status: "loaded"; histories: HistoryResponse[] }
  | { status: "failed"; error: FetchHistoryError };

/** 散歩履歴の一覧を取得し、再読み込みできるようにする。 */
export function useHistories(): {
  state: HistoriesState;
  reload: () => void;
} {
  const [state, setState] = useState<HistoriesState>({ status: "loading" });

  // 再読み込みボタンでこの値を更新し、取得の副作用を再実行させる。
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void fetchHistories().then((result) => {
      if (cancelled) {
        return;
      }

      setState(
        result.success
          ? { status: "loaded", histories: result.value }
          : { status: "failed", error: result.error },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function reload() {
    setState({ status: "loading" });
    setReloadKey((key) => key + 1);
  }

  return { state, reload };
}
