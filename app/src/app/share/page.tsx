"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getScoreForDate, DayScore } from "@/lib/storage";
import ShareCard from "@/components/ShareCard";
import html2canvas from "html2canvas";

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [dayScore, setDayScore] = useState<DayScore | null>(null);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!date) {
      router.push("/score");
      return;
    }
    const score = getScoreForDate(date);
    if (!score) {
      router.push("/score");
      return;
    }
    setDayScore(score);
  }, [date, router]);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });
    } catch {
      return null;
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        alert("Could not generate image. Try downloading instead.");
        setSharing(false);
        return;
      }

      const file = new File([blob], "wintheday.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "WinTheDay",
          text: `I scored ${Math.round(dayScore!.totalPercent)}% today! 🔥`,
        });
      } else {
        // Fallback: download
        downloadImage(blob);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        // User cancelled share, that's fine
        const blob = await generateImage();
        if (blob) downloadImage(blob);
      }
    }
    setSharing(false);
  };

  const handleDownload = async () => {
    setSharing(true);
    const blob = await generateImage();
    if (blob) downloadImage(blob);
    setSharing(false);
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wintheday-${date}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!dayScore) return null;

  return (
    <div className="h-dvh bg-[#0a0a0a] text-white flex flex-col items-center px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)] overflow-auto">
      <p className="text-[12px] text-[#444] tracking-[1px] uppercase mb-4">
        Your card
      </p>

      {/* Share card preview */}
      <div className="shadow-2xl">
        <ShareCard dayScore={dayScore} cardRef={cardRef} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full mt-4 max-w-[300px]">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 py-3.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          {sharing ? "..." : "Share"}
        </button>
        <button
          onClick={handleDownload}
          disabled={sharing}
          className="flex-1 py-3.5 rounded-xl text-[13px] font-semibold text-[#666] bg-[#111] border border-[#222] disabled:opacity-50"
        >
          Download
        </button>
      </div>

      <button
        onClick={() => router.push(`/result?date=${date}`)}
        className="text-[12px] text-[#333] mt-4"
      >
        ← Back to result
      </button>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0a0a0a]" />}>
      <ShareContent />
    </Suspense>
  );
}
