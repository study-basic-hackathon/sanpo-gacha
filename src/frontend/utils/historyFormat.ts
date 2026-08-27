/** 散歩履歴の値を画面表示用の文字列へ整形するユーティリティ。 */

const JAPAN_TIME_ZONE = "Asia/Tokyo";

/** ISO8601の日時を「2026年8月19日 10:30」形式にする。 */
export function formatVisitedAt(isoDateTime: string): string {
  const date = new Date(isoDateTime);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const formatted = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JAPAN_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  // ja-JP は「2026年8月19日 10:30」のように整形されるが、
  // 実行環境によって区切りが全角スペースになるため半角に揃える。
  return formatted.replace(/　/g, " ");
}

/** 分単位の散歩時間を「1時間30分」形式にする。 */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return "-";
  }

  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const remainder = total % 60;

  if (hours === 0) {
    return `${remainder}分`;
  }

  return remainder === 0 ? `${hours}時間` : `${hours}時間${remainder}分`;
}

/** メートル単位の距離を、1km以上ならkm表記にする。 */
export function formatDistance(meter: number): string {
  if (!Number.isFinite(meter) || meter < 0) {
    return "-";
  }

  if (meter < 1000) {
    return `${Math.round(meter)} m`;
  }

  return `${(meter / 1000).toFixed(1)} km`;
}

/** 歩数を3桁区切りにする。 */
export function formatSteps(steps: number): string {
  if (!Number.isFinite(steps) || steps < 0) {
    return "-";
  }

  return `${Math.round(steps).toLocaleString("ja-JP")}歩`;
}

/** 消費カロリーを整形する。小数点以下が無い場合は表示しない。 */
export function formatCalories(calories: number): string {
  if (!Number.isFinite(calories) || calories < 0) {
    return "-";
  }

  const rounded = Math.round(calories * 10) / 10;

  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} kcal`;
}

/** カンマ区切りのカテゴリ文字列を配列にする。 */
export function splitCategories(categories: string): string[] {
  return categories
    .split(",")
    .map((category) => category.trim())
    .filter((category) => category.length > 0);
}
