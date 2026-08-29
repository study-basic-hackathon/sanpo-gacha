import { apiClient } from "@/frontend/api/utils/apiClient";
import type { Result } from "@/frontend/utils/Result";
import { success, fail } from "@/frontend/utils/Result";

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
