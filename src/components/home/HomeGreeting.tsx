import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";

/** セッションが未取得のときに表示する名前。AppHeaderと同じ既定値を使う。 */
const FALLBACK_USER_NAME = "ユーザー";

/**
 * ログイン中のユーザー名を添えた挨拶を表示する。
 * セッションの取得（Cookie読み取り）で動的レンダリングになるため、
 * ホーム画面のほかの部分を静的なまま保てるよう独立したコンポーネントにしている。
 */
export default async function HomeGreeting() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name?.trim() || FALLBACK_USER_NAME;

  return <>GOOD AFTERNOON, {userName}さん</>;
}
