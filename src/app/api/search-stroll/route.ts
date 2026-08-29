import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import {
  searchStroll,
  SEARCH_STROLL_ERROR,
} from "@/backend/usecases/searchStroll";

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
      { message: SEARCH_STROLL_ERROR.invalidInput },
      { status: 400 },
    );
  }

  const result = await searchStroll(
    userId,
    body as Parameters<typeof searchStroll>[1],
  );

  if (!result.success) {
    const status =
      result.error === SEARCH_STROLL_ERROR.invalidInput
        ? 400
        : result.error === SEARCH_STROLL_ERROR.notFound
          ? 404
          : 500;
    return NextResponse.json({ message: result.error }, { status });
  }

  return NextResponse.json(result.value, { status: 200 });
}
