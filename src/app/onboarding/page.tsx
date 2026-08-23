import Image from "next/image";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9f6] text-[#24352b]">
      <div
        aria-hidden="true"
        className="absolute -left-32 bottom-[-180px] h-[440px] w-[440px] rounded-full bg-[#e6f0e5]"
      />

      <div
        aria-hidden="true"
        className="absolute -right-36 top-24 h-[420px] w-[420px] rounded-full bg-[#edf3e8]"
      />

      <header className="relative z-20 border-b border-[#d7e1d8] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/sanpo-gacha-logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />

            <span className="text-xl font-bold tracking-wide text-[#285c3d]">
              さんぽガチャ
            </span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1200px] items-center gap-14 px-8 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-[0.22em] text-[#5c8067]">
            A NEW STROLL EXPERIENCE
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-[1.35] tracking-tight text-[#214832] sm:text-5xl">
            いつもの散歩を、
            <br />
            小さな冒険に。
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-[#627168]">
            気分・散歩時間・カテゴリを選ぶと、
            <br className="hidden sm:block" />
            あなたに合った散歩先を提案します。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-[#d2ded3] bg-white px-4 py-2 text-sm text-[#52705c]">
              気分から
            </span>

            <span className="rounded-full border border-[#d2ded3] bg-white px-4 py-2 text-sm text-[#52705c]">
              散歩時間から
            </span>

            <span className="rounded-full border border-[#d2ded3] bg-white px-4 py-2 text-sm text-[#52705c]">
              カテゴリから
            </span>
          </div>

          <Link
            href="/location-permission"
            className="mt-10 inline-flex h-14 min-w-[230px] items-center justify-center rounded-xl bg-[#285c3d] px-9 font-semibold text-white shadow-[0_12px_30px_rgba(40,92,61,0.18)] transition hover:-translate-y-0.5 hover:bg-[#204d32] hover:shadow-[0_16px_34px_rgba(40,92,61,0.23)] focus:outline-none focus:ring-4 focus:ring-[#285c3d]/20"
          >
            はじめる
            <span aria-hidden="true" className="ml-3">
              →
            </span>
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div
            aria-hidden="true"
            className="absolute -inset-5 rotate-3 rounded-[36px] bg-[#dfeade]"
          />

          <div className="relative overflow-hidden rounded-[32px] border border-[#c9d8cb] bg-white p-5 shadow-[0_24px_70px_rgba(45,80,56,0.14)] sm:p-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-[#6b8773]">
                  TODAY&apos;S STROLL
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#244a34]">
                  新しい散歩先を見つけよう
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f2e7]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-[#35724d]"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21c4.5-3.7 7-7.1 7-11a7 7 0 1 0-14 0c0 3.9 2.5 7.3 7 11Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-lg bg-[#f0f5ef] px-3 py-2 text-xs font-medium text-[#506b58]">
                気分：リフレッシュ
              </span>

              <span className="rounded-lg bg-[#f0f5ef] px-3 py-2 text-xs font-medium text-[#506b58]">
                30分
              </span>

              <span className="rounded-lg bg-[#f0f5ef] px-3 py-2 text-xs font-medium text-[#506b58]">
                公園・自然
              </span>
            </div>

            <div
              className="relative mt-5 h-[310px] overflow-hidden rounded-2xl border border-[#dce5dd] bg-[#edf3ea]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(75,112,85,0.13) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            >
              <div
                aria-hidden="true"
                className="absolute -left-12 top-16 h-28 w-72 rotate-[-8deg] rounded-full bg-[#d7e6d4]"
              />

              <div
                aria-hidden="true"
                className="absolute -right-16 bottom-10 h-36 w-80 rotate-[12deg] rounded-full bg-[#dbe9d6]"
              />

              <svg
                viewBox="0 0 560 310"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <path
                  d="M70 250 C120 220, 125 155, 205 175 S310 235, 350 150 S430 70, 495 82"
                  fill="none"
                  stroke="white"
                  strokeWidth="18"
                  strokeLinecap="round"
                />

                <path
                  d="M70 250 C120 220, 125 155, 205 175 S310 235, 350 150 S430 70, 495 82"
                  fill="none"
                  stroke="#629071"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="2 13"
                />
              </svg>

              <div className="absolute bottom-[32px] left-[43px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#3f8057] shadow-md">
                  <span className="h-3 w-3 rounded-full bg-white" />
                </div>

                <span className="mt-2 block rounded-full bg-white px-3 py-1 text-center text-xs font-semibold text-[#456250] shadow-sm">
                  現在地
                </span>
              </div>

              <div className="absolute right-[28px] top-[35px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#f6fbf4] shadow-md">
                  <svg
                    viewBox="0 0 32 32"
                    className="h-8 w-8 fill-none stroke-[#3f8057]"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 26V14"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 17C10 17 7 13 7 8c6 0 9 3 9 9Z"
                      fill="#78a84f"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 14c0-5 3-8 9-8 0 5-3 9-9 9Z"
                      fill="#a7c96e"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span className="mt-2 block rounded-full bg-white px-3 py-1 text-center text-xs font-semibold text-[#456250] shadow-sm">
                  散歩先
                </span>
              </div>

              <div className="absolute bottom-5 right-5 rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
                <p className="text-xs text-[#728078]">散歩の先に</p>
                <p className="mt-1 text-sm font-bold text-[#31563f]">
                  知らない場所との出会い
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
