/** 散歩履歴から統計画面に表示する集計値を組み立てるユーティリティ。 */

import type { HistoryResponse } from "@/frontend/api/history";

const JAPAN_TIME_ZONE = "Asia/Tokyo";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** 月曜始まりの曜日ラベル。週間グラフとカレンダーの並び順に対応する。 */
export const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

/**
 * 今月の目標値。ユーザーごとの目標はAPIが未対応のため、当面は固定値で扱う。
 */
export const MONTHLY_GOAL = {
  /** 目標の合計距離（メートル）。 */
  meter: 20000,
  /** 目標の週あたりの散歩回数。 */
  countPerWeek: 3,
} as const;

/** 週間グラフの目盛りの刻み幅（歩）。 */
const STEP_AXIS_UNIT = 2000;

/** 週間グラフの目盛りの下限（歩）。歩数が少ない週でも棒が伸びすぎないようにする。 */
const STEP_AXIS_MINIMUM = 8000;

export type WeeklySteps = {
  /** 曜日ラベル（月〜日）。 */
  day: string;
  /** その日の日本時間での日付（YYYY-MM-DD）。 */
  date: string;
  /** その日の合計歩数。 */
  steps: number;
};

export type CalendarDay = {
  day: number;
  achieved: boolean;
};

export type AchievementCalendar = {
  year: number;
  month: number;
  /** 1日を正しい曜日の位置に置くための、月曜始まりでの空きマス数。 */
  leadingBlankCount: number;
  days: CalendarDay[];
};

export type GoalProgress = {
  goalMeter: number;
  achievedMeter: number;
  /** 目標達成までの残り距離。達成済みなら0。 */
  remainingMeter: number;
  /** 達成率（%）。100を超えることがある。 */
  ratePercent: number;
};

type JapanDate = {
  year: number;
  month: number;
  day: number;
};

const japanDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAPAN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 日本時間での年月日を取り出す。日付として解釈できない場合はnull。 */
function toJapanDate(date: Date): JapanDate | null {
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = japanDateFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  return { year, month, day };
}

function toDateKey({ year, month, day }: JapanDate): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * 日本時間の暦日をUTCの0時として扱い、日付の加算と曜日の判定をしやすくする。
 * 時差を含まない暦日どうしの計算なので、UTCとして扱っても曜日はずれない。
 */
function toUtcTime({ year, month, day }: JapanDate): number {
  return Date.UTC(year, month - 1, day);
}

function fromUtcTime(time: number): JapanDate {
  const date = new Date(time);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** 月曜を0とした曜日番号を返す。 */
function toWeekdayIndex(japanDate: JapanDate): number {
  return (new Date(toUtcTime(japanDate)).getUTCDay() + 6) % 7;
}

/** 集計できない歩数（NaN・負数など）は0として扱う。 */
function toValidSteps(steps: number): number {
  return Number.isFinite(steps) && steps > 0 ? steps : 0;
}

/** 日本時間の日付ごとに合計歩数を集計する。 */
function sumStepsByDate(histories: HistoryResponse[]): Map<string, number> {
  const stepsByDate = new Map<string, number>();

  for (const history of histories) {
    const date = toJapanDate(new Date(history.createdAt));

    if (!date) {
      continue;
    }

    const key = toDateKey(date);

    stepsByDate.set(key, (stepsByDate.get(key) ?? 0) + toValidSteps(history.steps));
  }

  return stepsByDate;
}

/** 今週（月曜始まり）の曜日ごとの歩数を集計する。 */
export function summarizeWeeklySteps(
  histories: HistoryResponse[],
  now: Date,
): WeeklySteps[] {
  const today = toJapanDate(now);

  if (!today) {
    return WEEKDAY_LABELS.map((day) => ({ day, date: "", steps: 0 }));
  }

  const stepsByDate = sumStepsByDate(histories);
  const mondayTime = toUtcTime(today) - toWeekdayIndex(today) * MILLISECONDS_PER_DAY;

  return WEEKDAY_LABELS.map((day, index) => {
    const key = toDateKey(fromUtcTime(mondayTime + index * MILLISECONDS_PER_DAY));

    return { day, date: key, steps: Math.round(stepsByDate.get(key) ?? 0) };
  });
}

/** 週間グラフの縦軸の上限を、歩数に合わせてきりの良い値にする。 */
export function stepAxisMax(weeklySteps: WeeklySteps[]): number {
  const max = weeklySteps.reduce(
    (largest, item) => Math.max(largest, item.steps),
    0,
  );

  if (max <= STEP_AXIS_MINIMUM) {
    return STEP_AXIS_MINIMUM;
  }

  return Math.ceil(max / STEP_AXIS_UNIT) * STEP_AXIS_UNIT;
}

/** 今月（日本時間）の散歩した日を、カレンダー表示用に組み立てる。 */
export function buildAchievementCalendar(
  histories: HistoryResponse[],
  now: Date,
): AchievementCalendar {
  const today = toJapanDate(now);

  if (!today) {
    return { year: 0, month: 0, leadingBlankCount: 0, days: [] };
  }

  const achievedDays = new Set<number>();

  for (const history of histories) {
    const date = toJapanDate(new Date(history.createdAt));

    if (date && date.year === today.year && date.month === today.month) {
      achievedDays.add(date.day);
    }
  }

  // 翌月の0日目は、今月の末日を指す。
  const dayCount = new Date(Date.UTC(today.year, today.month, 0)).getUTCDate();

  return {
    year: today.year,
    month: today.month,
    leadingBlankCount: toWeekdayIndex({ ...today, day: 1 }),
    days: Array.from({ length: dayCount }, (_, index) => ({
      day: index + 1,
      achieved: achievedDays.has(index + 1),
    })),
  };
}

/** 今月の合計距離から、目標に対する進捗を求める。 */
export function calcGoalProgress(totalMeter: number): GoalProgress {
  const achievedMeter = Number.isFinite(totalMeter) && totalMeter > 0 ? totalMeter : 0;
  const goalMeter = MONTHLY_GOAL.meter;

  return {
    goalMeter,
    achievedMeter,
    remainingMeter: Math.max(goalMeter - achievedMeter, 0),
    ratePercent: goalMeter > 0 ? Math.round((achievedMeter / goalMeter) * 100) : 0,
  };
}
