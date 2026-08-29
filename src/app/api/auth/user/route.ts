import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/backend/lib/auth";
import {
  deleteUser,
  DELETE_USER_ERROR,
} from "@/backend/usecases/auth";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "authentication_required" },
      { status: 401 },
    );
  }

  const result = await deleteUser(userId);

  if (!result.success) {
    const status = result.error === DELETE_USER_ERROR.notFound ? 404 : 500;
    return NextResponse.json({ message: result.error }, { status });
  }

  return new NextResponse(null, { status: 204 });
}
