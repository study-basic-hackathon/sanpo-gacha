import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { deleteImage, IMAGE_ERROR } from "@/backend/usecases/image";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "authentication_required" },
      { status: 401 },
    );
  }

  const { imageId } = await context.params;

  const result = await deleteImage(userId, imageId);

  if (!result.success) {
    const status = result.error === IMAGE_ERROR.notFound ? 404 : 500;
    return NextResponse.json({ message: result.error }, { status });
  }

  return new NextResponse(null, { status: 204 });
}
