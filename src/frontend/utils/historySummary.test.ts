import { describe, expect, it } from "vitest";
import type { HistoryResponse } from "@/frontend/api/history";
import {
  ALL_CATEGORIES,
  PERIOD,
  categoryVisual,
  collectCategories,
  filterHistories,
  pickRecentHistories,
  summarizeMonthlyStats,
} from "@/frontend/utils/historySummary";

// 2026年8月19日 19:30(JST)を「現在」として扱う。
const NOW = new Date("2026-08-19T10:30:00.000Z");

function history(overrides: Partial<HistoryResponse> = {}): HistoryResponse {
  return {
    historyId: "history-001",
    placeId: "ChIJ123456789",
    placeName: "木場公園",
    categories: "公園",
    timeTaken: 45,
    meter: 3200,
    steps: 4200,
    calories: 180.5,
    createdAt: "2026-08-19T10:30:00.000Z",
    imagePaths: [],
    ...overrides,
  };
}

const thisMonth = history({
  historyId: "this-month",
  createdAt: "2026-08-02T01:00:00.000Z",
});

const lastMonth = history({
  historyId: "last-month",
  categories: "神社・寺",
  createdAt: "2026-07-10T01:00:00.000Z",
});

const threeMonthsAgo = history({
  historyId: "three-months-ago",
  categories: "カフェ",
  createdAt: "2026-05-31T15:00:00.000Z",
});

const lastYear = history({
  historyId: "last-year",
  categories: "公園",
  createdAt: "2025-12-20T01:00:00.000Z",
});

const all = [thisMonth, lastMonth, threeMonthsAgo, lastYear];

function idsOf(histories: HistoryResponse[]) {
  return histories.map((item) => item.historyId);
}

describe("filterHistories", () => {
  it("期間・カテゴリともに指定がない場合はすべて返す", () => {
    const filtered = filterHistories(
      all,
      { period: PERIOD.all, category: ALL_CATEGORIES },
      NOW,
    );

    expect(idsOf(filtered)).toEqual(idsOf(all));
  });

  it("今月を指定すると日本時間で今月の履歴だけ返す", () => {
    const filtered = filterHistories(
      all,
      { period: PERIOD.thisMonth, category: ALL_CATEGORIES },
      NOW,
    );

    expect(idsOf(filtered)).toEqual(["this-month"]);
  });

  it("過去3か月は今月を含む直近3か月分の履歴を返す", () => {
    const filtered = filterHistories(
      all,
      { period: PERIOD.last3Months, category: ALL_CATEGORIES },
      NOW,
    );

    // 2026-05-31T15:00Z は日本時間では6月1日のため、6月以降として含まれる。
    expect(idsOf(filtered)).toEqual([
      "this-month",
      "last-month",
      "three-months-ago",
    ]);
  });

  it("今年を指定すると同じ年の履歴だけ返す", () => {
    const filtered = filterHistories(
      all,
      { period: PERIOD.thisYear, category: ALL_CATEGORIES },
      NOW,
    );

    expect(idsOf(filtered)).toEqual([
      "this-month",
      "last-month",
      "three-months-ago",
    ]);
  });

  it("カテゴリを指定するとそのカテゴリを含む履歴だけ返す", () => {
    const filtered = filterHistories(
      all,
      { period: PERIOD.all, category: "公園" },
      NOW,
    );

    expect(idsOf(filtered)).toEqual(["this-month", "last-year"]);
  });

  it("複数カテゴリの履歴も、含まれていれば対象にする", () => {
    const multiple = history({
      historyId: "multiple",
      categories: "公園, 景色",
    });

    const filtered = filterHistories(
      [multiple],
      { period: PERIOD.all, category: "景色" },
      NOW,
    );

    expect(idsOf(filtered)).toEqual(["multiple"]);
  });

  it("期間とカテゴリは同時に適用される", () => {
    const filtered = filterHistories(
      all,
      { period: PERIOD.thisYear, category: "公園" },
      NOW,
    );

    expect(idsOf(filtered)).toEqual(["this-month"]);
  });

  it("日付として解釈できない履歴は期間指定時に除外する", () => {
    const broken = history({ historyId: "broken", createdAt: "not-a-date" });

    const filtered = filterHistories(
      [broken],
      { period: PERIOD.thisMonth, category: ALL_CATEGORIES },
      NOW,
    );

    expect(filtered).toEqual([]);
  });
});

describe("collectCategories", () => {
  it("履歴に登場するカテゴリを重複なく日本語の並び順で返す", () => {
    const categories = collectCategories([
      history({ categories: "公園, 景色" }),
      history({ categories: "公園" }),
      history({ categories: "カフェ" }),
    ]);

    expect(categories).toEqual(["カフェ", "景色", "公園"]);
  });

  it("カテゴリが空の履歴は無視する", () => {
    expect(collectCategories([history({ categories: "" })])).toEqual([]);
  });
});

describe("summarizeMonthlyStats", () => {
  it("今月の回数・距離・時間・歩数を集計する", () => {
    const stats = summarizeMonthlyStats(
      [
        history({
          createdAt: "2026-08-02T01:00:00.000Z",
          meter: 3200,
          timeTaken: 45,
          steps: 4200,
        }),
        history({
          createdAt: "2026-08-18T01:00:00.000Z",
          meter: 1800,
          timeTaken: 24,
          steps: 2400,
        }),
        history({
          createdAt: "2026-07-18T01:00:00.000Z",
          meter: 9999,
          timeTaken: 99,
          steps: 9999,
        }),
      ],
      NOW,
    );

    expect(stats).toEqual({
      strollCount: 2,
      totalMeter: 5000,
      totalMinutes: 69,
      totalSteps: 6600,
    });
  });

  it("今月の履歴が無い場合はすべて0になる", () => {
    expect(summarizeMonthlyStats([lastYear], NOW)).toEqual({
      strollCount: 0,
      totalMeter: 0,
      totalMinutes: 0,
      totalSteps: 0,
    });
  });
});

describe("pickRecentHistories", () => {
  it("新しい順に指定件数だけ返す", () => {
    const recent = pickRecentHistories(
      [lastMonth, lastYear, thisMonth, threeMonthsAgo],
      3,
    );

    expect(idsOf(recent)).toEqual([
      "this-month",
      "last-month",
      "three-months-ago",
    ]);
  });

  it("件数が足りない場合はある分だけ返す", () => {
    expect(pickRecentHistories([thisMonth], 3)).toHaveLength(1);
  });
});

describe("categoryVisual", () => {
  it.each([
    ["神社・寺", "⛩️"],
    ["公園", "🌳"],
    ["カフェ", "☕"],
    ["景色", "🏞️"],
  ])("%sには%sを割り当てる", (categories, icon) => {
    expect(categoryVisual(categories).icon).toBe(icon);
  });

  it("未知のカテゴリには既定のアイコンを割り当てる", () => {
    expect(categoryVisual("動物園").icon).toBe("🚶");
  });

  it("複数カテゴリの場合は先頭のカテゴリで判定する", () => {
    expect(categoryVisual("カフェ, 公園").icon).toBe("☕");
  });

  it("カードの背景色も併せて返す", () => {
    expect(categoryVisual("公園").background).toEqual(expect.any(String));
  });
});
