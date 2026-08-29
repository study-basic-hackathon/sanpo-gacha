/** 散歩履歴の一覧を画面表示用に絞り込み・集計するユーティリティ。 */

import type { HistoryResponse } from "@/frontend/api/history";
import { splitCategories } from "@/frontend/utils/historyFormat";

const JAPAN_TIME_ZONE = "Asia/Tokyo";

/** 履歴一覧の期間絞り込みの選択肢。 */
export const PERIOD = {
  all: "all",
  thisMonth: "thisMonth",
  last3Months: "last3Months",
  thisYear: "thisYear",
} as const;

export type Period = (typeof PERIOD)[keyof typeof PERIOD];

/** カテゴリ絞り込みの「すべて」を表す値。 */
export const ALL_CATEGORIES = "all";

export type HistoryFilter = {
  period: Period;
  category: string;
};

export type MonthlyStats = {
  strollCount: number;
  totalMeter: number;
  totalMinutes: number;
  totalSteps: number;
};

const japanDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAPAN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 日本時間での年・月を取り出す。日付として解釈できない場合はnull。 */
function toJapanYearMonth(
  isoDateTime: string,
): { year: number; month: number } | null {
  const date = new Date(isoDateTime);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = japanDateFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return null;
  }

  return { year, month };
}

/** 年月を1つの連番にして、月をまたぐ比較をしやすくする。 */
function toMonthIndex({ year, month }: { year: number; month: number }): number {
  return year * 12 + (month - 1);
}

function isWithinPeriod(
  isoDateTime: string,
  period: Period,
  now: Date,
): boolean {
  if (period === PERIOD.all) {
    return true;
  }

  const target = toJapanYearMonth(isoDateTime);

  if (!target) {
    return false;
  }

  const current = toJapanYearMonth(now.toISOString());

  if (!current) {
    return false;
  }

  if (period === PERIOD.thisYear) {
    return target.year === current.year;
  }

  const difference = toMonthIndex(current) - toMonthIndex(target);

  if (period === PERIOD.thisMonth) {
    return difference === 0;
  }

  // 過去3か月は、今月を含む直近3か月分を対象にする。
  return difference >= 0 && difference <= 2;
}

/** 期間とカテゴリの条件で履歴を絞り込む。 */
export function filterHistories(
  histories: HistoryResponse[],
  { period, category }: HistoryFilter,
  now: Date,
): HistoryResponse[] {
  return histories.filter((history) => {
    if (!isWithinPeriod(history.createdAt, period, now)) {
      return false;
    }

    if (category === ALL_CATEGORIES) {
      return true;
    }

    return splitCategories(history.categories).includes(category);
  });
}

/** 履歴に登場するカテゴリを重複なく取り出す。 */
export function collectCategories(histories: HistoryResponse[]): string[] {
  const categories = new Set<string>();

  for (const history of histories) {
    for (const category of splitCategories(history.categories)) {
      categories.add(category);
    }
  }

  return [...categories].sort((a, b) => a.localeCompare(b, "ja"));
}

/** 今月（日本時間）の散歩回数・距離・時間・歩数を集計する。 */
export function summarizeMonthlyStats(
  histories: HistoryResponse[],
  now: Date,
): MonthlyStats {
  const thisMonth = histories.filter((history) =>
    isWithinPeriod(history.createdAt, PERIOD.thisMonth, now),
  );

  const sum = (values: number[]) =>
    values.reduce(
      (total, value) => (Number.isFinite(value) ? total + value : total),
      0,
    );

  return {
    strollCount: thisMonth.length,
    totalMeter: Math.round(sum(thisMonth.map((history) => history.meter))),
    totalMinutes: Math.round(sum(thisMonth.map((history) => history.timeTaken))),
    totalSteps: Math.round(sum(thisMonth.map((history) => history.steps))),
  };
}

/** 新しい順に指定件数の履歴を取り出す。 */
export function pickRecentHistories(
  histories: HistoryResponse[],
  limit: number,
): HistoryResponse[] {
  return [...histories]
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
    .slice(0, Math.max(limit, 0));
}

/** 並び替え用に時刻を数値化する。解釈できない日付は最後に回す。 */
function toTime(isoDateTime: string): number {
  const time = new Date(isoDateTime).getTime();

  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

export type CategoryVisual = {
  icon: string;
  background: string;
};

const CATEGORY_VISUALS: Array<{ keywords: string[]; visual: CategoryVisual }> = [
  {
    keywords: ["神社", "寺"],
    visual: {
      icon: "⛩️",
      background: "linear-gradient(135deg, #dcebdc, #b9d5bd)",
    },
  },
  {
    keywords: ["公園", "庭園"],
    visual: {
      icon: "🌳",
      background: "linear-gradient(135deg, #e8f1d8, #c8dda7)",
    },
  },
  {
    keywords: ["カフェ", "喫茶"],
    visual: {
      icon: "☕",
      background: "linear-gradient(135deg, #f3e7d5, #dec6a5)",
    },
  },
  {
    keywords: ["景色", "展望", "海", "川"],
    visual: {
      icon: "🏞️",
      background: "linear-gradient(135deg, #dceaf2, #aecfe0)",
    },
  },
];

const DEFAULT_CATEGORY_VISUAL: CategoryVisual = {
  icon: "🚶",
  background: "linear-gradient(135deg, #e6ece6, #c6d4c8)",
};

/** カテゴリに応じたカードのアイコンと背景を返す。 */
export function categoryVisual(categories: string): CategoryVisual {
  const [primary] = splitCategories(categories);

  if (!primary) {
    return DEFAULT_CATEGORY_VISUAL;
  }

  const matched = CATEGORY_VISUALS.find(({ keywords }) =>
    keywords.some((keyword) => primary.includes(keyword)),
  );

  return matched?.visual ?? DEFAULT_CATEGORY_VISUAL;
}
