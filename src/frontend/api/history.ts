import { apiClient } from "@/frontend/api/utils/apiClient";
import type { components } from "@/contracts/api";
import type { Result } from "@/frontend/utils/Result";
import { success, fail } from "@/frontend/utils/Result";

export type HistoryResponse = components["schemas"]["HistoryResponse"];

export const FETCH_HISTORY_ERROR = {
  unauthorized: "unauthorized",
  notFound: "not_found",
  unexpected: "unexpected",
} as const;

export type FetchHistoryError =
  (typeof FETCH_HISTORY_ERROR)[keyof typeof FETCH_HISTORY_ERROR];

/** 散歩履歴の詳細を取得する。 */
export async function fetchHistory(
  historyId: string,
): Promise<Result<HistoryResponse, FetchHistoryError>> {
  const { data, response } = await apiClient.GET("/api/history/{historyId}", {
    params: { path: { historyId } },
  });

  if (!data) {
    if (response.status === 401) {
      return fail(FETCH_HISTORY_ERROR.unauthorized);
    }

    if (response.status === 404) {
      return fail(FETCH_HISTORY_ERROR.notFound);
    }

    return fail(FETCH_HISTORY_ERROR.unexpected);
  }

  return success(data);
}
