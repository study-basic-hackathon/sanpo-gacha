import { describe, expect, it } from "vitest";
import type { HistoryResponse } from "@/frontend/api/history";
import {
  MONTHLY_GOAL,
  buildAchievementCalendar,
  calcGoalProgress,
  stepAxisMax,
  summarizeWeeklySteps,
} from "@/frontend/utils/historyStatistics";

// 2026年8月19日(水) 19:30(JST)を「現在」として扱う。この週は8/17(月)〜8/23(日)。
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

function stepsOf(weekly: ReturnType<typeof summarizeWeeklySteps>) {
  return weekly.map((item) => item.steps);
}

describe("summarizeWeeklySteps", () => {
  it("月曜から日曜までの7日分を返す", () => {
    const weekly = summarizeWeeklySteps([], NOW);

    expect(weekly.map((item) => item.day)).toEqual([
      "月",
      "火",
      "水",
      "木",
      "金",
      "土",
      "日",
    ]);

    expect(weekly.map((item) => item.date)).toEqual([
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
    ]);
  });

  it("同じ日の歩数を合算する", () => {
    const weekly = summarizeWeeklySteps(
      [
        history({ createdAt: "2026-08-17T01:00:00.000Z", steps: 3000 }),
        history({ createdAt: "2026-08-19T02:00:00.000Z", steps: 4200 }),
        history({ createdAt: "2026-08-19T08:00:00.000Z", steps: 1800 }),
      ],
      NOW,
    );

    expect(stepsOf(weekly)).toEqual([3000, 0, 6000, 0, 0, 0, 0]);
  });

  it("今週以外の履歴は数えない", () => {
    const weekly = summarizeWeeklySteps(
      [
        history({ createdAt: "2026-08-16T01:00:00.000Z", steps: 5000 }),
        history({ createdAt: "2026-08-24T01:00:00.000Z", steps: 5000 }),
      ],
      NOW,
    );

    expect(stepsOf(weekly)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("日本時間の日付で振り分ける", () => {
    // UTCでは8/16(日)だが、日本時間では8/17(月)にあたる。
    const weekly = summarizeWeeklySteps(
      [history({ createdAt: "2026-08-16T16:00:00.000Z", steps: 2500 })],
      NOW,
    );

    expect(stepsOf(weekly)).toEqual([2500, 0, 0, 0, 0, 0, 0]);
  });

  it("歩数として扱えない値は0にする", () => {
    const weekly = summarizeWeeklySteps(
      [
        history({ createdAt: "2026-08-19T01:00:00.000Z", steps: Number.NaN }),
        history({ createdAt: "2026-08-19T02:00:00.000Z", steps: -100 }),
        history({ createdAt: "不正な日付", steps: 9999 }),
      ],
      NOW,
    );

    expect(stepsOf(weekly)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("stepAxisMax", () => {
  it("歩数が少ない週でも下限の8000を返す", () => {
    expect(stepAxisMax(summarizeWeeklySteps([], NOW))).toBe(8000);
  });

  it("下限を超える場合は2000刻みに切り上げる", () => {
    const weekly = summarizeWeeklySteps(
      [history({ createdAt: "2026-08-19T01:00:00.000Z", steps: 9100 })],
      NOW,
    );

    expect(stepAxisMax(weekly)).toBe(10000);
  });
});

describe("buildAchievementCalendar", () => {
  it("今月の日数と、1日の位置を返す", () => {
    const calendar = buildAchievementCalendar([], NOW);

    expect(calendar.year).toBe(2026);
    expect(calendar.month).toBe(8);
    expect(calendar.days).toHaveLength(31);
    // 2026年8月1日は土曜日なので、月曜始まりでは5マス空ける。
    expect(calendar.leadingBlankCount).toBe(5);
  });

  it("今月に散歩した日へ印をつける", () => {
    const calendar = buildAchievementCalendar(
      [
        history({ createdAt: "2026-08-03T01:00:00.000Z" }),
        history({ createdAt: "2026-08-03T05:00:00.000Z" }),
        history({ createdAt: "2026-08-19T01:00:00.000Z" }),
        history({ createdAt: "2026-07-19T01:00:00.000Z" }),
      ],
      NOW,
    );

    const achieved = calendar.days
      .filter((item) => item.achieved)
      .map((item) => item.day);

    expect(achieved).toEqual([3, 19]);
  });
});

describe("calcGoalProgress", () => {
  it("目標に対する残り距離と達成率を求める", () => {
    expect(calcGoalProgress(18400)).toEqual({
      goalMeter: MONTHLY_GOAL.meter,
      achievedMeter: 18400,
      remainingMeter: 1600,
      ratePercent: 92,
    });
  });

  it("目標を超えても残り距離は0にする", () => {
    const progress = calcGoalProgress(25000);

    expect(progress.remainingMeter).toBe(0);
    expect(progress.ratePercent).toBe(125);
  });

  it("距離として扱えない値は0にする", () => {
    expect(calcGoalProgress(Number.NaN).achievedMeter).toBe(0);
  });
});
