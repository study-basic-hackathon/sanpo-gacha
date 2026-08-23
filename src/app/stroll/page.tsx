import Link from "next/link";

export default function StrollPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <header className="border-b border-[#b7c2b9] bg-white">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/home"
            className="text-xl font-bold tracking-wide text-[#285c3d]"
          >
            🌿 さんぽガチャ
          </Link>

          <p className="text-sm font-semibold text-[#53675a]">
            散歩中：富岡八幡宮
          </p>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="relative min-h-[620px] overflow-hidden border-r border-[#cbd5cd] bg-[#e8efe2]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(rgba(109,139,116,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(109,139,116,0.12) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div
            aria-hidden="true"
            className="absolute -left-[10%] top-[18%] h-12 w-[75%] rotate-6 rounded-full bg-white/65"
          />

          <div
            aria-hidden="true"
            className="absolute right-[-8%] top-[52%] h-12 w-[80%] -rotate-12 rounded-full bg-white/65"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[10%] left-[18%] h-10 w-[75%] rotate-3 rounded-full bg-white/55"
          />

          <div
            aria-hidden="true"
            className="absolute -right-20 top-[12%] h-[78%] w-44 rotate-6 rounded-[50%] bg-[#cde4e4]"
          />

          <div className="absolute left-6 top-6 rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-[#607266]">地図</p>
            <p className="mt-1 text-sm font-bold text-[#31533c]">
              門前仲町 → 富岡八幡宮
            </p>
          </div>

          <div className="absolute left-[25%] top-[68%] text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#3c7d55]/15">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#3c7d55] text-white shadow-lg">
                ●
              </div>

              <span className="absolute -bottom-8 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">
                現在位置
              </span>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute left-[31%] top-[36%] h-[34%] w-[35%] -rotate-[28deg] border-t-4 border-dashed border-[#789780]"
          />

          <div className="absolute left-[66%] top-[27%] text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#c66f50] text-2xl shadow-lg">
              ★
            </div>

            <span className="mt-2 block whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">
              富岡八幡宮
            </span>
          </div>

          <div className="absolute bottom-6 left-6 rounded-xl bg-white/90 px-4 py-3 text-xs text-[#657269] shadow-sm">
            <span className="font-bold text-[#3c7d55]">●</span> 現在位置
            <span className="ml-5 font-bold text-[#c66f50]">★</span> 目的地
          </div>
        </section>

        <aside className="bg-white px-7 py-9">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#719078]">
            NOW WALKING
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#24483a]">
            散歩中
          </h1>

          <div className="mt-8">
            <p className="text-sm text-[#758178]">目的地</p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7e9df] text-xl">
                ⛩️
              </div>

              <p className="text-lg font-bold">富岡八幡宮へ</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f3f7f3] p-4">
              <p className="text-xs text-[#77837b]">残り距離</p>
              <p className="mt-2 text-lg font-bold text-[#2f6544]">
                約1.1 km
              </p>
            </div>

            <div className="rounded-2xl bg-[#f3f7f3] p-4">
              <p className="text-xs text-[#77837b]">経過時間</p>
              <p className="mt-2 text-lg font-bold text-[#2f6544]">
                5分
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-xs text-[#748078]">
              <span>現在位置</span>
              <span>目的地</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dce5de]">
              <div className="h-full w-[28%] rounded-full bg-[#3c7d55]" />
            </div>

            <p className="mt-2 text-right text-xs text-[#748078]">
              約28%進みました
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-[#fff8e9] p-4 text-sm leading-6 text-[#745e34]">
            地図を見るときは、安全な場所で立ち止まりましょう。
          </div>

          <Link
            href="/stroll/photo"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-full border border-[#7e9684] bg-white font-semibold text-[#405a48] transition hover:bg-[#f1f6f2]"
          >
            📷 写真を撮る
          </Link>

          <Link
            href="/stroll/result"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-[#c98782] bg-white font-semibold text-[#9b3834] transition hover:bg-[#fff5f4]"
          >
            散歩を終了する
          </Link>
        </aside>
      </div>
    </main>
  );
}
