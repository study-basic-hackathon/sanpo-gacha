import { apiClient } from "@/frontend/api/utils/apiClient";
import type { Result } from "@/frontend/utils/Result";
import { success, fail } from "@/frontend/utils/Result";

export const DELETE_USER_ERROR = {
  unauthorized: "unauthorized",
  notFound: "not_found",
  unexpected: "unexpected",
} as const;

export type DeleteUserError =
  (typeof DELETE_USER_ERROR)[keyof typeof DELETE_USER_ERROR];

export async function registerUser(
  email: string,
  username: string,
  password: string,
): Promise<Result<string, unknown>> {
  const { data, error } = await apiClient.POST("/api/auth/register", {
    body: {
      email,
      username,
      password,
    },
  });

  if (error) {
    return fail(error.message || "Registration failed");
  }

  return success(data.id);
}

/** 現在ログインしているユーザーのアカウントを削除する。 */
export async function deleteUser(): Promise<Result<void, DeleteUserError>> {
  const { response } = await apiClient.DELETE("/api/auth/user");

  if (response.status === 204) {
    return success(undefined);
  }

  if (response.status === 401) {
    return fail(DELETE_USER_ERROR.unauthorized);
  }

  if (response.status === 404) {
    return fail(DELETE_USER_ERROR.notFound);
  }

  return fail(DELETE_USER_ERROR.unexpected);
}
