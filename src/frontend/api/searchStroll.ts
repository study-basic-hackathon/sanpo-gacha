import { apiClient } from "@/frontend/api/utils/apiClient";
import type { components } from "@/contracts/api";
import type { Result } from "@/frontend/utils/Result";
import { fail, success } from "@/frontend/utils/Result";

export type SearchStrollPayload = components["schemas"]["SearchStrollPayload"];
export type SearchStrollResponse = components["schemas"]["SearchStrollResponse"];

export const SEARCH_STROLL_ERROR = {
  invalidInput: "invalid_input",
  unauthorized: "unauthorized",
  notFound: "not_found",
  unexpected: "unexpected",
} as const;

export type SearchStrollError =
  (typeof SEARCH_STROLL_ERROR)[keyof typeof SEARCH_STROLL_ERROR];

/** 指定した散歩条件に合う目的地候補を取得する。 */
export async function searchStroll(
  payload: SearchStrollPayload,
): Promise<Result<SearchStrollResponse, SearchStrollError>> {
  const { data, response } = await apiClient.POST("/api/search-stroll", {
    body: payload,
  });

  if (!data) {
    if (response.status === 400) {
      return fail(SEARCH_STROLL_ERROR.invalidInput);
    }

    if (response.status === 401) {
      return fail(SEARCH_STROLL_ERROR.unauthorized);
    }

    if (response.status === 404) {
      return fail(SEARCH_STROLL_ERROR.notFound);
    }

    return fail(SEARCH_STROLL_ERROR.unexpected);
  }

  return success(data);
}
