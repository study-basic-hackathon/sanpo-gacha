import Link from "next/link";

const results = [
  {
    value: "24分",
    label: "歩いた時間",
  },
  {
    value: "1.6 km",
    label: "距離",
  },
  {
    value: "2,340歩",
    label: "歩数",
  },
  {
    value: "85 kcal",
    label: "消費",
  },
];

export default function StrollResultPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff2bd] text-[#24352b]">
      <div
        aria-hidden="true"
        className="absolute left-[8%] top-[12%] text-3xl text-[#d98265]"
      >
        ✦
      </div>

      <div
        aria-hidden="true"
        className="absolute right-[12%] top-[18%] text-2xl text-[#e3a64e]"
      >
        ✧
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[18%] left-[14%] text-2xl text-[#e3a64e]"
      >
        ✧
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[12%] right-[8%] text-4xl text-[#d98265]"
      >
        ✦
      </div>

      <div
        aria-hidden="true"
        className="absolute left-[24%] top-[32%] h-3 w-3 rounded-full bg-[#f08062]"
      />

      <div
        aria-hidden="true"
        className="absolute right-[24%] top-[38%] h-3 w-3 rounded-full bg-[#e3b85b]"
      />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm font-semibold tracking-[0.22em] text-[#b26c45]">
          STROLL COMPLETE
        </p>

        <h1 className="mt-4 text-4xl font-bold text-[#24483a] sm:text-5xl">
          🎉 到着しました！
        </h1>

        <div className="mt-9 w-full max-w-xl rounded-3xl border border-[#e3b85b] bg-white px-8 py-7 shadow-sm">
          <p className="text-sm text-[#7c7968]">
            今回の目的地は
          </p>

          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7e9df] text-2xl">
              ⛩️
            </div>

            <p className="text-2xl font-bold text-[#24483a]">
              富岡八幡宮
            </p>
          </div>
        </div>

        <div className="mt-7 grid w-full max-w-2xl grid-cols-2 overflow-hidden rounded-3xl border border-[#d8cbaa] bg-white shadow-sm sm:grid-cols-4">
          {results.map((result, index) => (
            <div
              key={result.label}
              className={[
                "px-4 py-6",
                index !== 0 ? "border-l border-[#e6e1d2]" : "",
                index >= 2
                  ? "border-t border-[#e6e1d2] sm:border-t-0"
                  : "",
              ].join(" ")}
            >
              <p className="text-xl font-bold text-[#2f6544]">
                {result.value}
              </p>

              <p className="mt-2 text-xs text-[#777d72]">
                {result.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-9 grid w-full max-w-xl gap-4 sm:grid-cols-2">
          <Link
            href="/history/1"
            className="flex h-13 items-center justify-center rounded-full bg-[#24483a] px-7 font-semibold text-white transition hover:bg-[#19382c]"
          >
            散歩を記録する
          </Link>

          <Link
            href="/share/1"
            className="flex h-13 items-center justify-center rounded-full bg-[#f08062] px-7 font-semibold text-white transition hover:bg-[#d96d51]"
          >
            写真と一緒にシェア
          </Link>
        </div>
      </section>
    </main>
  );
}
