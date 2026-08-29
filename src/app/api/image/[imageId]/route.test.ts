import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭に巻き上げられるため、モックは vi.hoisted で定義する。
const { getServerSessionMock, deleteImageMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  deleteImageMock: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession: getServerSessionMock }));

vi.mock("@/backend/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/backend/usecases/image", async () => {
  const actual =
    await vi.importActual<typeof import("@/backend/usecases/image")>(
      "@/backend/usecases/image",
    );

  return { IMAGE_ERROR: actual.IMAGE_ERROR, deleteImage: deleteImageMock };
});

import { DELETE } from "@/app/api/image/[imageId]/route";
import { fail, success } from "@/backend/utils/Result";

const USER_ID = "user-1";
const IMAGE_ID = "image-001";

function request() {
  return new Request(`http://localhost:3000/api/image/${IMAGE_ID}`, {
    method: "DELETE",
  });
}

function context(imageId = IMAGE_ID) {
  return { params: Promise.resolve({ imageId }) };
}

function signedIn() {
  getServerSessionMock.mockResolvedValue({
    user: { id: USER_ID, email: "user@example.com" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/image/{imageId}", () => {
  it("未認証の場合は401とauthentication_requiredを返す", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await DELETE(request(), context());

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: "authentication_required" });
    expect(deleteImageMock).not.toHaveBeenCalled();
  });

  it("削除に成功した場合は204を返し、本文は空にする", async () => {
    signedIn();
    deleteImageMock.mockResolvedValue(success(undefined));

    const res = await DELETE(request(), context());

    expect(res.status).toBe(204);
    await expect(res.text()).resolves.toBe("");
    expect(deleteImageMock).toHaveBeenCalledWith(USER_ID, IMAGE_ID);
  });

  it("not_foundの場合は404を返す", async () => {
    signedIn();
    deleteImageMock.mockResolvedValue(fail("not_found"));

    const res = await DELETE(request(), context());

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ message: "not_found" });
  });

  it("unexpectedの場合は500を返す", async () => {
    signedIn();
    deleteImageMock.mockResolvedValue(fail("unexpected_error_occurred"));

    const res = await DELETE(request(), context());

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: "unexpected_error_occurred",
    });
  });
});
