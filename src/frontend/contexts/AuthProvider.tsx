"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/** NextAuthのセッションをクライアントコンポーネント配下で共有する。 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
