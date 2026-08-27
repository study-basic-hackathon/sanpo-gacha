import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { getHistory, HISTORY_ERROR } from "@/backend/usecases/history";

type RouteContext = {
  params: Promise<{ historyId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "authentication_required" },
      { status: 401 },
    );
  }

  const { historyId } = await context.params;

  const result = await getHistory(userId, historyId);

  if (!result.success) {
    const status = result.error === HISTORY_ERROR.notFound ? 404 : 500;
    return NextResponse.json({ message: result.error }, { status });
  }

  return NextResponse.json(result.value, { status: 200 });
}
