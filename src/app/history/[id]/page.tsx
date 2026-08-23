import Link from "next/link";

type HistoryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const historyData: Record<
  string,
  {
    place: string;
    category: string;
    date: string;
    time: string;
    duration: string;
    distance: string;
    steps: string;
    memo: string;
    hasPhoto: boolean;
    photoUrl?: string;
  }
> = {
  "1": {
    place: "富岡八幡宮",
    category: "神社・寺",
    date: "2026年8月9日",
    time: "15:20",
    duration: "40分",
    distance: "2.8 km",
    steps: "3,920歩",
    memo: "天気が良く、境内をゆっくり散歩できました。",
    hasPhoto: true,

    // 今はサンプル画像です。
    // 後から実際に撮影した写真のURLへ変更できます。
    photoUrl:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80",
  },

  "2": {
    place: "木場公園",
    category: "公園",
    date: "2026年8月8日",
    time: "10:30",
    duration: "35分",
    distance: "2.4 km",
    steps: "3,360歩",
    memo: "木陰が多く、涼しく歩くことができました。",
    hasPhoto: false,
  },

  "3": {
    place: "川沿いカフェ",
    category: "カフェ",
    date: "2026年8月7日",
    time: "14:10",
    duration: "25分",
    distance: "1.7 km",
    steps: "2,380歩",
    memo: "川沿いを歩いたあと、カフェで休憩しました。",
    hasPhoto: false,
  },
};

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const { id } = await params;
  const stroll = historyData[id] ?? historyData["1"];

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <header className="border-b border-[#d7e1d8] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/home"
            className="text-lg font-bold tracking-wide text-[#285c3d]"
          >
            🌿 さんぽガチャ
          </Link>

          <nav className="flex items-center gap-7 text-sm font-medium text-[#42584a]">
            <Link href="/home">ホーム</Link>
            <Link href="/history" className="text-[#2f7d50]">
              散歩履歴
            </Link>
            <Link href="/favorites">お気に入り</Link>
            <Link href="/statistics">統計</Link>
            <Link href="/settings">アカウント設定</Link>
          </nav>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f2e8] font-bold text-[#285c3d]">
            王
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#47705a] hover:text-[#285c3d]"
        >
          ← 散歩履歴に戻る
        </Link>

        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#62816c]">
            STROLL RECORD
          </p>

          <div className="mt-2 flex items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold text-[#173f2d]">
                {stroll.place}
              </h1>
              <p className="mt-2 text-sm text-[#647469]">
                {stroll.category} ・ {stroll.date} {stroll.time}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#d7e1d8] bg-white shadow-sm">
          {stroll.hasPhoto && stroll.photoUrl ? (
            <div
              className="h-[360px] bg-cover bg-center"
              style={{
                backgroundImage: `url("${stroll.photoUrl}")`,
              }}
              role="img"
              aria-label={`${stroll.place}で撮影した写真`}
            />
          ) : (
            <div className="flex h-[360px] flex-col items-center justify-center bg-[#edf3ec] text-[#708076]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                📷
              </div>
              <p className="mt-5 font-semibold">写真はありません</p>
              <p className="mt-2 text-sm">
                この散歩では写真が保存されていません。
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 divide-x divide-[#e2e8e2] border-t border-[#e2e8e2]">
            <ResultItem label="散歩時間" value={stroll.duration} />
            <ResultItem label="距離" value={stroll.distance} />
            <ResultItem label="歩数" value={stroll.steps} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#214832]">散歩ルート</h2>

            <div className="relative mt-5 h-64 overflow-hidden rounded-xl bg-[#e5eee4]">
              <div className="absolute left-[15%] top-[68%] h-3 w-3 rounded-full bg-[#397c52] ring-4 ring-white" />
              <div className="absolute left-[15%] top-[25%] h-3 w-3 rounded-full bg-[#d97855] ring-4 ring-white" />

              <div className="absolute left-[15.5%] top-[28%] h-[40%] w-[44%] rounded-bl-[90px] border-b-4 border-l-4 border-[#76a685]" />
              <div className="absolute left-[57%] top-[28%] h-[18%] w-[22%] rounded-tr-[70px] border-r-4 border-t-4 border-[#76a685]" />

              <span className="absolute bottom-[13%] left-[9%] rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                出発
              </span>
              <span className="absolute left-[8%] top-[10%] rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                到着
              </span>

              <div className="absolute bottom-5 right-5 rounded-lg bg-white/90 px-3 py-2 text-xs text-[#53675a] shadow-sm">
                門前仲町 → {stroll.place}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#214832]">散歩メモ</h2>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#526258]">
              {stroll.memo}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-5 py-6 text-center">
      <p className="text-xs text-[#738078]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[#24533a]">{value}</p>
    </div>
  );
}
