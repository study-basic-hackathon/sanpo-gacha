import { randomUUID } from "node:crypto";

import { prisma } from "@/backend/lib/db/prisma";
import {
  getImageStorage,
  imageExtensionOf,
  isSupportedImageContentType,
} from "@/backend/lib/storage/imageStorage";
import type { components } from "@/contracts/api";
import type { Result } from "@/backend/utils/Result";
import { success, fail } from "@/backend/utils/Result";

export type ImageResponse = components["schemas"]["ImageResponse"];

export const IMAGE_ERROR = {
  invalidInput: "invalid_input",
  notFound: "not_found",
  unexpected: "unexpected_error_occurred",
} as const;

export type ImageError = (typeof IMAGE_ERROR)[keyof typeof IMAGE_ERROR];

/** 受け付ける画像の最大サイズ（5MB）。 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface CreateImageInput {
  historyId: string;
  contentType: string;
  body: Buffer;
}

/** prisma.picture の取得時に必要な列。 */
const pictureSelect = {
  id: true,
  strollHistoryId: true,
  imagePath: true,
} as const;

interface PictureRecord {
  id: string;
  strollHistoryId: string;
  imagePath: string;
}

function toImageResponse(record: PictureRecord): ImageResponse {
  return {
    imageId: record.id,
    historyId: record.strollHistoryId,
    imagePath: record.imagePath,
  };
}

/**
 * ログインユーザー自身の画像を取得する。
 * 他人の画像や存在しない画像は、区別せず not_found として扱う。
 */
async function findOwnedPicture(
  userId: string,
  imageId: string,
): Promise<Result<PictureRecord, ImageError>> {
  const id = typeof imageId === "string" ? imageId.trim() : "";

  if (!id) {
    return fail(IMAGE_ERROR.notFound);
  }

  try {
    // strollHistory.userId を条件に含めることで、他人の画像は扱えないようにする。
    const record = await prisma.picture.findFirst({
      where: { id, strollHistory: { userId } },
      select: pictureSelect,
    });

    return record ? success(record) : fail(IMAGE_ERROR.notFound);
  } catch {
    return fail(IMAGE_ERROR.unexpected);
  }
}

export async function createImage(
  userId: string,
  input: CreateImageInput,
): Promise<Result<ImageResponse, ImageError>> {
  const historyId =
    typeof input?.historyId === "string" ? input.historyId.trim() : "";
  const contentType =
    typeof input?.contentType === "string" ? input.contentType.trim() : "";
  const body = Buffer.isBuffer(input?.body) ? input.body : null;

  if (!historyId || !isSupportedImageContentType(contentType)) {
    return fail(IMAGE_ERROR.invalidInput);
  }

  if (!body || body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) {
    return fail(IMAGE_ERROR.invalidInput);
  }

  try {
    // where に userId を含めることで、他人の履歴には画像を追加できないようにする。
    const history = await prisma.strollHistory.findFirst({
      where: { id: historyId, userId },
      select: { id: true },
    });

    if (!history) {
      return fail(IMAGE_ERROR.notFound);
    }

    const storage = getImageStorage();

    // 参照パスは認証を通らずに配信されるため、推測できないことが保護になる。
    // ファイル名にUUIDを使い、URLを知らなければ到達できない状態を保つ。
    const key = `${historyId}/${randomUUID()}${imageExtensionOf(contentType)}`;

    await storage.save(key, body, contentType);

    try {
      const picture = await prisma.picture.create({
        data: {
          strollHistoryId: historyId,
          imagePath: storage.toReferencePath(key),
        },
      });

      return success(toImageResponse(picture));
    } catch (error) {
      // レコードが作られなければファイルは参照されないため、保存を取り消す。
      await storage.remove(key).catch(() => undefined);
      throw error;
    }
  } catch {
    return fail(IMAGE_ERROR.unexpected);
  }
}

export async function deleteImage(
  userId: string,
  imageId: string,
): Promise<Result<void, ImageError>> {
  const found = await findOwnedPicture(userId, imageId);

  if (!found.success) {
    return fail(found.error);
  }

  try {
    await prisma.picture.delete({ where: { id: found.value.id } });
  } catch {
    return fail(IMAGE_ERROR.unexpected);
  }

  try {
    const storage = getImageStorage();
    const key = storage.toStorageKey(found.value.imagePath);

    // ストレージ管理外の参照パス（シードなどの既存データ）は消す対象がない。
    if (key) {
      await storage.remove(key);
    }
  } catch {
    // レコードは削除済みなので、ファイルが残っても削除自体は成功として扱う。
  }

  return success(undefined);
}
