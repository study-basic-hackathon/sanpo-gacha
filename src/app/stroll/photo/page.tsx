import Link from "next/link";

export default function StrollPhotoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#27332e] text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#779a91] via-[#9eb9a2] to-[#506b56]">
        <div
          aria-hidden="true"
          className="absolute right-[15%] top-[14%] h-24 w-24 rounded-full bg-[#f8dfaa]/80 blur-sm"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-[20%] left-[-8%] h-[42%] w-[70%] rotate-6 rounded-[50%] bg-[#496752]"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-[12%] right-[-10%] h-[45%] w-[75%] -rotate-6 rounded-[50%] bg-[#385744]"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-[18%] left-[18%] h-40 w-12 rounded-t-full bg-[#294838]"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-[30%] left-[12%] h-32 w-32 rounded-full bg-[#3d654c]"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-[22%] right-[20%] h-48 w-12 rounded-t-full bg-[#294838]"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-[36%] right-[14%] h-36 w-36 rounded-full bg-[#456e52]"
        />
      </div>

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-start justify-between px-6 py-6 sm:px-10">
          <Link
            href="/stroll"
            aria-label="カメラを閉じる"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-[#24483a] shadow-lg transition hover:scale-105"
          >
            ×
          </Link>

          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/75">
              CAMERA PREVIEW
            </p>

            <h1 className="mt-2 text-xl font-bold sm:text-2xl">
              散歩中に見つけた景色を残そう
            </h1>
          </div>

          <div aria-hidden="true" className="h-12 w-12" />
        </header>

        <section className="flex flex-1 items-center justify-center px-6 pb-6">
          <div className="relative aspect-[3/2] w-full max-w-3xl rounded-2xl border border-dashed border-white/90">
            <span className="absolute left-[-1px] top-[-1px] h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-white" />
            <span className="absolute right-[-1px] top-[-1px] h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-white" />
            <span className="absolute bottom-[-1px] left-[-1px] h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-white" />
            <span className="absolute bottom-[-1px] right-[-1px] h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-white" />

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/35 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              写真ガイド枠
            </p>
          </div>
        </section>

        <footer className="flex flex-col items-center pb-8 pt-4">
          <Link
            href="/stroll/photo/confirm"
            aria-label="写真を撮影する"
            className="flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-white bg-[#f08062] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition hover:scale-105 active:scale-95"
          >
            <span className="h-14 w-14 rounded-full border-2 border-white/80" />
          </Link>

          <p className="mt-3 text-sm font-semibold text-white/85">
            撮影
          </p>
        </footer>
      </div>
    </main>
  );
}