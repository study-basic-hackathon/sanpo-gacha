import AppHeader from "@/components/layout/AppHeader";
import HistoryList from "@/components/history/HistoryList";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <AppHeader active="history" />

      <section className="mx-auto max-w-[1200px] px-6 py-12">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[#719078]">
            STROLL HISTORY
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#24483a]">散歩履歴</h1>
        </div>

        <HistoryList />
      </section>
    </main>
  );
}
