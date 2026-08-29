import { NextResponse } from "next/server";
import { register } from "@/backend/usecases/auth";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await register({
    email: body.email ?? "",
    username: body.username ?? "",
    password: body.password ?? "",
  });

  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.value }, { status: 201 });
}
