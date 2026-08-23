import Link from "next/link";

export default function StrollPhotoConfirmPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <header className="border-b border-[#c8d1ca] bg-white">
        <div className="mx-auto flex h-20 max-w-[1100px] items-center px-6">
          <Link
            href="/home"
            className="text-xl font-bold tracking-wide text-[#285c3d]"
          >
            🌿 さんぽガチャ
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h1 className="text-3xl font-bold text-[#24483a]">
          この写真を保存しますか？
        </h1>

        <p className="mt-3 text-sm text-[#66736b]">
          撮影場所と日時も散歩記録に保存されます。
        </p>

        <div className="relative mt-8 aspect-[3/2] w-full overflow-hidden rounded-3xl border border-[#8eaa95] bg-gradient-to-b from-[#779a91] via-[#9eb9a2] to-[#506b56] shadow-sm">
          <div
            aria-hidden="true"
            className="absolute right-[15%] top-[12%] h-24 w-24 rounded-full bg-[#f8dfaa]/80 blur-sm"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[15%] left-[-8%] h-[45%] w-[70%] rotate-6 rounded-[50%] bg-[#496752]"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[7%] right-[-10%] h-[48%] w-[75%] -rotate-6 rounded-[50%] bg-[#385744]"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[15%] left-[18%] h-40 w-12 rounded-t-full bg-[#294838]"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[28%] left-[12%] h-32 w-32 rounded-full bg-[#3d654c]"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[19%] right-[20%] h-48 w-12 rounded-t-full bg-[#294838]"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[34%] right-[14%] h-36 w-36 rounded-full bg-[#456e52]"
          />

          <div className="absolute bottom-5 left-5 rounded-xl bg-black/40 px-4 py-3 text-left text-sm text-white backdrop-blur-sm">
            <p className="font-semibold">📍 富岡八幡宮付近</p>
            <p className="mt-1 text-xs text-white/80">
              2026年8月23日 15:20
            </p>
          </div>

          <div className="absolute right-5 top-5 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-[#385343] shadow-sm">
            撮影した写真
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/stroll/photo"
            className="flex h-13 items-center justify-center rounded-full border border-[#829789] bg-white font-semibold text-[#405a48] transition hover:bg-[#f1f6f2]"
          >
            撮り直す
          </Link>

          <Link
            href="/stroll"
            className="flex h-13 items-center justify-center rounded-full bg-[#24483a] font-semibold text-white transition hover:bg-[#19382c]"
          >
            写真を保存
          </Link>
        </div>

        <p className="mt-5 text-xs leading-5 text-[#89938d]">
          ※ 現在はモック画面のため、実際の写真データは保存されません。
        </p>
      </section>
    </main>
  );
}
