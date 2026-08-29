import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import {
  createImage,
  IMAGE_ERROR,
  MAX_IMAGE_BYTES,
  type ImageError,
} from "@/backend/usecases/image";

/**
 * 受け付けるリクエスト全体の上限。multipart のヘッダなどの分だけ画像の上限より広げる。
 * formData() は本文を全てメモリに読み込むため、その前に明らかに大きすぎる
 * リクエストを弾く。Content-Length を送らないリクエストは素通りするので、
 * 本格的な制限はリバースプロキシ側で行う想定。
 */
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 1024 * 1024;

function errorStatus(error: ImageError): number {
  switch (error) {
    case IMAGE_ERROR.invalidInput:
      return 400;
    case IMAGE_ERROR.notFound:
      return 404;
    default:
      return 500;
  }
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

  const contentLength = Number(req.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { message: IMAGE_ERROR.invalidInput },
      { status: 400 },
    );
  }

  let form: FormData;

  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { message: IMAGE_ERROR.invalidInput },
      { status: 400 },
    );
  }

  const historyId = form.get("historyId");
  const file = form.get("file");

  if (typeof historyId !== "string" || !(file instanceof File)) {
    return NextResponse.json(
      { message: IMAGE_ERROR.invalidInput },
      { status: 400 },
    );
  }

  const result = await createImage(userId, {
    historyId,
    contentType: file.type,
    body: Buffer.from(await file.arrayBuffer()),
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error },
      { status: errorStatus(result.error) },
    );
  }

  return NextResponse.json(result.value, { status: 201 });
}
