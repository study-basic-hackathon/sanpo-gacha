import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import {
  createHistory,
  getHistories,
  HISTORY_ERROR,
} from "@/backend/usecases/history";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "authentication_required" },
      { status: 401 },
    );
  }

  const result = await getHistories(userId);

  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json(result.value, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "authentication_required" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: HISTORY_ERROR.invalidInput },
      { status: 400 },
    );
  }

  const result = await createHistory(
    userId,
    body as Parameters<typeof createHistory>[1],
  );

  if (!result.success) {
    const status = result.error === HISTORY_ERROR.invalidInput ? 400 : 500;
    return NextResponse.json({ message: result.error }, { status });
  }

  return NextResponse.json(result.value, { status: 201 });
}
