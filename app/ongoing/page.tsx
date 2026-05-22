import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImageTrail } from "@/components/retro/ImageTrail";
import { OngoingRetrosSection } from "@/components/retro/OngoingRetrosSection";
import { trailImages } from "@/lib/retro/trail-images";

export default function OngoingRetrosPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden overflow-y-auto px-4 py-8 text-neutral-950 sm:px-6 sm:py-10">
      <ImageTrail items={trailImages} variant={5} />
      <div className="relative z-10">
        <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="ghost-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
        <OngoingRetrosSection />
      </div>
    </main>
  );
}
