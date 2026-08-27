import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import HistoryDetail from "@/components/history/HistoryDetail";

type HistoryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <AppHeader active="history" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#47705a] hover:text-[#285c3d]"
        >
          ← 散歩履歴に戻る
        </Link>

        <HistoryDetail historyId={id} />
      </div>
    </main>
  );
}
