import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭に巻き上げられるため、モックは vi.hoisted で定義する。
const { getServerSessionMock, createImageMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  createImageMock: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession: getServerSessionMock }));

vi.mock("@/backend/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/backend/usecases/image", async () => {
  const actual =
    await vi.importActual<typeof import("@/backend/usecases/image")>(
      "@/backend/usecases/image",
    );

  return {
    IMAGE_ERROR: actual.IMAGE_ERROR,
    MAX_IMAGE_BYTES: actual.MAX_IMAGE_BYTES,
    createImage: createImageMock,
  };
});

import { POST } from "@/app/api/image/route";
import { MAX_IMAGE_BYTES } from "@/backend/usecases/image";
import { fail, success } from "@/backend/utils/Result";

const USER_ID = "user-1";

const imageResponse = {
  imageId: "image-001",
  historyId: "history-001",
  imagePath: "/images/history-001/9f2c1a4e.jpg",
};

function multipartRequest(form: FormData) {
  return new Request("http://localhost:3000/api/image", {
    method: "POST",
    body: form,
  });
}

function validForm() {
  const form = new FormData();
  form.set("historyId", "history-001");
  form.set(
    "file",
    new File([new Uint8Array([1, 2, 3])], "photo.jpg", { type: "image/jpeg" }),
  );

  return form;
}

function signedIn() {
  getServerSessionMock.mockResolvedValue({
    user: { id: USER_ID, email: "user@example.com" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/image", () => {
  it("未認証の場合は401とauthentication_requiredを返す", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await POST(multipartRequest(validForm()));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: "authentication_required" });
    expect(createImageMock).not.toHaveBeenCalled();
  });

  it("登録に成功した場合は201とImageResponseを返す", async () => {
    signedIn();
    createImageMock.mockResolvedValue(success(imageResponse));

    const res = await POST(multipartRequest(validForm()));

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual(imageResponse);
  });

  it("フォームの内容をユースケースに渡す", async () => {
    signedIn();
    createImageMock.mockResolvedValue(success(imageResponse));

    await POST(multipartRequest(validForm()));

    expect(createImageMock).toHaveBeenCalledTimes(1);
    const [userId, input] = createImageMock.mock.calls[0];
    expect(userId).toBe(USER_ID);
    expect(input.historyId).toBe("history-001");
    expect(input.contentType).toBe("image/jpeg");
    expect(Buffer.from(input.body)).toEqual(Buffer.from([1, 2, 3]));
  });

  it("multipart/form-dataでない場合は400とinvalid_inputを返す", async () => {
    signedIn();

    const res = await POST(
      new Request("http://localhost:3000/api/image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ historyId: "history-001" }),
      }),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "invalid_input" });
    expect(createImageMock).not.toHaveBeenCalled();
  });

  it("fileが無い場合は400とinvalid_inputを返す", async () => {
    signedIn();
    const form = new FormData();
    form.set("historyId", "history-001");

    const res = await POST(multipartRequest(form));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "invalid_input" });
    expect(createImageMock).not.toHaveBeenCalled();
  });

  it("fileがファイルでない場合は400とinvalid_inputを返す", async () => {
    signedIn();
    const form = new FormData();
    form.set("historyId", "history-001");
    form.set("file", "not-a-file");

    const res = await POST(multipartRequest(form));

    expect(res.status).toBe(400);
    expect(createImageMock).not.toHaveBeenCalled();
  });

  it("historyIdが無い場合は400とinvalid_inputを返す", async () => {
    signedIn();
    const form = new FormData();
    form.set(
      "file",
      new File([new Uint8Array([1])], "photo.jpg", { type: "image/jpeg" }),
    );

    const res = await POST(multipartRequest(form));

    expect(res.status).toBe(400);
    expect(createImageMock).not.toHaveBeenCalled();
  });

  it("Content-Lengthが上限を大きく超える場合は本文を読まずに400を返す", async () => {
    signedIn();

    const res = await POST(
      new Request("http://localhost:3000/api/image", {
        method: "POST",
        headers: {
          "content-type": "multipart/form-data; boundary=x",
          "content-length": String(MAX_IMAGE_BYTES + 1024 * 1024 + 1),
        },
        body: "--x--",
      }),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "invalid_input" });
    expect(createImageMock).not.toHaveBeenCalled();
  });

  it("ユースケースがinvalid_inputを返した場合は400を返す", async () => {
    signedIn();
    createImageMock.mockResolvedValue(fail("invalid_input"));

    const res = await POST(multipartRequest(validForm()));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "invalid_input" });
  });

  it("ユースケースがnot_foundを返した場合は404を返す", async () => {
    signedIn();
    createImageMock.mockResolvedValue(fail("not_found"));

    const res = await POST(multipartRequest(validForm()));

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ message: "not_found" });
  });

  it("ユースケースがunexpectedを返した場合は500を返す", async () => {
    signedIn();
    createImageMock.mockResolvedValue(fail("unexpected_error_occurred"));

    const res = await POST(multipartRequest(validForm()));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: "unexpected_error_occurred",
    });
  });
});
