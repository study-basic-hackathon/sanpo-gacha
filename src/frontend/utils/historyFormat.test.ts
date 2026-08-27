import { describe, expect, it } from "vitest";
import {
  formatCalories,
  formatDistance,
  formatDuration,
  formatMonthDay,
  formatPlaceName,
  formatSteps,
  formatVisitedAt,
  formatVisitedDate,
  splitCategories,
} from "@/frontend/utils/historyFormat";

describe("formatVisitedAt", () => {
  it("日本時間の年月日と時刻に整形する", () => {
    expect(formatVisitedAt("2026-08-19T10:30:00.000Z")).toBe(
      "2026年8月19日 19:30",
    );
  });

  it("日付として解釈できない場合はハイフンを返す", () => {
    expect(formatVisitedAt("not-a-date")).toBe("-");
  });
});

describe("formatDuration", () => {
  it.each([
    [45, "45分"],
    [60, "1時間"],
    [90, "1時間30分"],
    [0, "0分"],
    [45.4, "45分"],
    [-1, "-"],
  ])("%s分は%sになる", (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});

describe("formatDistance", () => {
  it.each([
    [3200, "3.2 km"],
    [1000, "1.0 km"],
    [800, "800 m"],
    [0, "0 m"],
    [-1, "-"],
  ])("%sメートルは%sになる", (meter, expected) => {
    expect(formatDistance(meter)).toBe(expected);
  });
});

describe("formatSteps", () => {
  it("3桁区切りの歩数にする", () => {
    expect(formatSteps(4200)).toBe("4,200歩");
  });
});

describe("formatCalories", () => {
  it.each([
    [180.5, "180.5 kcal"],
    [180, "180 kcal"],
    [180.04, "180 kcal"],
  ])("%sは%sになる", (calories, expected) => {
    expect(formatCalories(calories)).toBe(expected);
  });
});

describe("splitCategories", () => {
  it("カンマ区切りの文字列を配列にする", () => {
    expect(splitCategories("公園, 神社")).toEqual(["公園", "神社"]);
  });

  it("空文字の場合は空配列を返す", () => {
    expect(splitCategories("")).toEqual([]);
  });
});

describe("formatVisitedDate", () => {
  it("日本時間のスラッシュ区切りの日付にする", () => {
    expect(formatVisitedDate("2026-08-19T10:30:00.000Z")).toBe("2026/08/19");
  });

  it("日付として解釈できない場合はハイフンを返す", () => {
    expect(formatVisitedDate("not-a-date")).toBe("-");
  });
});

describe("formatMonthDay", () => {
  it("日本時間の月日にする", () => {
    expect(formatMonthDay("2026-08-19T10:30:00.000Z")).toBe("8月19日");
  });

  it("日付として解釈できない場合はハイフンを返す", () => {
    expect(formatMonthDay("not-a-date")).toBe("-");
  });
});

describe("formatPlaceName", () => {
  it("場所名をそのまま返す", () => {
    expect(formatPlaceName("木場公園")).toBe("木場公園");
  });

  it.each([[""], ["   "]])("場所名が未取得の場合は代替文言を返す", (placeName) => {
    expect(formatPlaceName(placeName)).toBe("名称未取得の場所");
  });
});
