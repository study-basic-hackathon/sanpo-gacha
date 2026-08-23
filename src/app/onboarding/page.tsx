import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9f6] text-[#24352b]">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-[#e4f0e4]"
      />

      <div
        aria-hidden="true"
        className="absolute -right-28 bottom-10 h-96 w-96 rounded-full bg-[#edf4e8]"
      />

      <header className="relative z-10 mx-auto flex h-24 max-w-[1200px] items-center px-8 lg:px-12">
        <Link
          href="/"
          className="text-xl font-bold tracking-wide text-[#285c3d]"
        >
          🌿 さんぽガチャ
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-20 pt-6 text-center">
        <p className="text-sm font-semibold tracking-[0.22em] text-[#5c8067]">
          A NEW STROLL EXPERIENCE
        </p>

        <div className="relative mt-8 flex h-[260px] w-full max-w-[430px] items-center justify-center overflow-hidden rounded-[50%] border border-[#7da58a] bg-[#ddeedd] shadow-[0_18px_50px_rgba(60,125,85,0.12)]">
          <div
            aria-hidden="true"
            className="absolute left-10 top-10 h-3 w-3 rounded-full bg-white/80"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-12 right-12 h-5 w-5 rounded-full bg-[#b8d3bd]"
          />

          <div className="flex items-center gap-6 sm:gap-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#9ab6a2] bg-white text-4xl font-bold text-[#3c6d4d] shadow-sm">
              ？
            </div>

            <div className="flex flex-col items-center gap-2 text-[#66836f]">
              <span className="text-xs font-semibold tracking-widest">
                DISCOVER
              </span>
              <span aria-hidden="true" className="text-4xl">
                →
              </span>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-sm">
              🌳
            </div>
          </div>

          <p className="absolute bottom-7 text-sm font-semibold tracking-wide text-[#446650]">
            知らない場所との出会い
          </p>
        </div>

        <h1 className="mt-10 text-3xl font-bold tracking-tight text-[#24483a] sm:text-4xl">
          いつもの散歩を、小さな冒険に。
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-[#66736b]">
          気分・散歩時間・カテゴリを選ぶと、
          <br className="hidden sm:block" />
          あなたに合った散歩先を提案します。
        </p>

        <Link
          href="/location-permission"
          className="mt-10 flex h-14 min-w-[260px] items-center justify-center rounded-full bg-[#24483a] px-10 font-semibold text-white shadow-[0_10px_30px_rgba(36,72,58,0.2)] transition hover:-translate-y-0.5 hover:bg-[#19382c] hover:shadow-[0_14px_35px_rgba(36,72,58,0.25)] focus:outline-none focus:ring-4 focus:ring-[#24483a]/20"
        >
          はじめる
          <span aria-hidden="true" className="ml-3">
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
