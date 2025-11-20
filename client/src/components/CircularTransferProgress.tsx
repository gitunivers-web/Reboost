import { useEffect, useState } from "react";

export default function CircularTransferProgress({ percent }: { percent: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;

  // On utilise displayedPercent pour piloter **TOUT** : texte + cercle SVG
  const [displayedPercent, setDisplayedPercent] = useState(0);

  useEffect(() => {
    // Animation progressive : target = percent
    let start = displayedPercent;
    const target = percent;
    const delta = Math.abs(target - start);

    let duration = delta < 5 ? Math.max(800, delta * 300) : 9000;
    const startTime = performance.now();

    let rafId: number;
    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
      const eased = easeOutCubic(t);
      const current = start + (target - start) * eased;
      setDisplayedPercent(current);
      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        setDisplayedPercent(target);
      }
    };
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);

  // Calculer le strokeDashoffset à partir du displayedPercent (pas du prop percent)
  const progress = (displayedPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="160" height="160" className="transform -rotate-90">
          <circle cx="80" cy="80" r={r} stroke="#E5E7EB" strokeWidth="10" fill="none" />
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke="url(#gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">
            {Math.round(displayedPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
}
