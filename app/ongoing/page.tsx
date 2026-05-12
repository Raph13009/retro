import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OngoingRetrosSection } from "@/components/retro/OngoingRetrosSection";

export default function OngoingRetrosPage() {
  return (
    <main className="relative z-10 min-h-dvh overflow-y-auto px-6 py-10 text-slate-100">
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="ghost-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </div>
      <OngoingRetrosSection />
    </main>
  );
}
