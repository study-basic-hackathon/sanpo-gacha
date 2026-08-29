import { prisma } from "@/backend/lib/db/prisma";
import type { components } from "@/contracts/api";
import type { Result } from "@/backend/utils/Result";
import { success, fail } from "@/backend/utils/Result";

export type HistoryResponse = components["schemas"]["HistoryResponse"];
export type CreateHistoryPayload = components["schemas"]["CreateHistoryPayload"];

export const HISTORY_ERROR = {
  invalidInput: "invalid_input",
  notFound: "not_found",
  unexpected: "unexpected_error_occurred",
} as const;

export type HistoryError = (typeof HISTORY_ERROR)[keyof typeof HISTORY_ERROR];

/** カテゴリ名の区切り文字。API上は1つの文字列として扱う。 */
const CATEGORY_SEPARATOR = ",";

/** prisma.strollHistory の取得時に必要な関連データ。 */
const historyInclude = {
  categories: { select: { category: { select: { name: true } } } },
  pictures: { select: { imagePath: true } },
} as const;

interface StrollHistoryRecord {
  id: string;
  visitedPlaceId: string;
  placeName: string | null;
  visitedAt: Date;
  strollTime: number;
  meter: number;
  steps: number;
  calories: unknown;
  categories: { category: { name: string } }[];
  pictures: { imagePath: string }[];
}

function toHistoryResponse(record: StrollHistoryRecord): HistoryResponse {
  return {
    historyId: record.id,
    placeId: record.visitedPlaceId,
    placeName: record.placeName ?? "",
    categories: record.categories
      .map(({ category }) => category.name)
      .join(CATEGORY_SEPARATOR),
    timeTaken: record.strollTime,
    meter: record.meter,
    steps: record.steps,
    calories: Number(record.calories),
    createdAt: record.visitedAt.toISOString(),
    imagePaths: record.pictures.map((picture) => picture.imagePath),
  };
}

/** 数値として扱えない値（NaN・Infinity・負数・数値以外）を弾く。 */
function parseNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}

export async function getHistories(
  userId: string,
): Promise<Result<HistoryResponse[], HistoryError>> {
  try {
    const records = await prisma.strollHistory.findMany({
      where: { userId },
      include: historyInclude,
      orderBy: { visitedAt: "desc" },
    });

    return success(records.map(toHistoryResponse));
  } catch {
    return fail(HISTORY_ERROR.unexpected);
  }
}

export async function getHistory(
  userId: string,
  historyId: string,
): Promise<Result<HistoryResponse, HistoryError>> {
  const id = typeof historyId === "string" ? historyId.trim() : "";

  if (!id) {
    return fail(HISTORY_ERROR.notFound);
  }

  try {
    // where に userId を含めることで、他人の履歴は取得できないようにする。
    const record = await prisma.strollHistory.findFirst({
      where: { id, userId },
      include: historyInclude,
    });

    if (!record) {
      return fail(HISTORY_ERROR.notFound);
    }

    return success(toHistoryResponse(record));
  } catch {
    return fail(HISTORY_ERROR.unexpected);
  }
}

export async function createHistory(
  userId: string,
  payload: CreateHistoryPayload,
): Promise<Result<HistoryResponse, HistoryError>> {
  try {
    const placeId = typeof payload?.placeId === "string" ? payload.placeId.trim() : "";
    const placeName =
      typeof payload?.placeName === "string" ? payload.placeName.trim() : "";
    const categoryName =
      typeof payload?.categories === "string" ? payload.categories.trim() : "";
    const timeTaken = parseNonNegativeNumber(payload?.timeTaken);
    const meter = parseNonNegativeNumber(payload?.meter);
    const steps = parseNonNegativeNumber(payload?.steps);
    const calories = parseNonNegativeNumber(payload?.calories);

    if (
      !placeId ||
      !placeName ||
      !categoryName ||
      timeTaken === null ||
      meter === null ||
      steps === null ||
      calories === null
    ) {
      return fail(HISTORY_ERROR.invalidInput);
    }

    const visitedAt = payload.createdAt ? new Date(payload.createdAt) : new Date();

    if (Number.isNaN(visitedAt.getTime())) {
      return fail(HISTORY_ERROR.invalidInput);
    }

    // Category.name は一意制約がないため、検索してから無ければ作成する。
    const category =
      (await prisma.category.findFirst({ where: { name: categoryName } })) ??
      (await prisma.category.create({ data: { name: categoryName } }));

    const record = await prisma.strollHistory.create({
      data: {
        userId,
        visitedPlaceId: placeId,
        placeName,
        visitedAt,
        strollTime: Math.round(timeTaken),
        meter: Math.round(meter),
        steps: Math.round(steps),
        calories,
        categories: { create: [{ categoryId: category.id }] },
      },
      include: historyInclude,
    });

    return success(toHistoryResponse(record));
  } catch {
    return fail(HISTORY_ERROR.unexpected);
  }
}
