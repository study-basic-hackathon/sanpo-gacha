import createClient from "openapi-fetch";
import type { paths } from "@/contracts/api";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export const apiClient = createClient<paths>({
  baseUrl,
});
