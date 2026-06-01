"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface Stats {
  uploadCount: number;
  downloadCount: number;
  downloadedMB: number;
}

export function StatsStrip() {
  const cardRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const mbRef = useRef<HTMLDivElement>(null);
  const previous = useRef<Stats>({ uploadCount: 0, downloadCount: 0, downloadedMB: 0 });
  const [, setStats] = useState<Stats | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!cardRef.current) return;
    if (reduced) {
      cardRef.current.style.opacity = "1";
      return;
    }
    anime({
      targets: cardRef.current,
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 520,
      delay: 240,
      easing: "spring(1, 80, 12, 0)",
    });
  }, [reduced]);

  const tweenTo = (el: HTMLDivElement | null, from: number, to: number, isFloat = false) => {
    if (!el) return;
    if (reduced) {
      el.textContent = isFloat ? to.toFixed(2) : to.toLocaleString();
      return;
    }
    const obj = { n: from };
    anime({
      targets: obj,
      n: to,
      duration: 1100,
      easing: "easeOutExpo",
      update: () => {
        el.textContent = isFloat ? obj.n.toFixed(2) : Math.round(obj.n).toLocaleString();
      },
    });
  };

  const refresh = async () => {
    try {
      const res = await fetch("/api/statistics", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Stats;
      tweenTo(uploadRef.current, previous.current.uploadCount, data.uploadCount);
      tweenTo(downloadRef.current, previous.current.downloadCount, data.downloadCount);
      tweenTo(mbRef.current, previous.current.downloadedMB, data.downloadedMB, true);
      previous.current = data;
      setStats(data);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refresh();
    const handle = setInterval(refresh, 8000);
    return () => clearInterval(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={cardRef} className="card">
      <h2>statistics</h2>
      <div className="stats">
        <div className="stat">
          <div ref={uploadRef} className="value mono">
            0
          </div>
          <div className="label">uploads</div>
        </div>
        <div className="stat">
          <div ref={downloadRef} className="value mono">
            0
          </div>
          <div className="label">downloads</div>
        </div>
        <div className="stat">
          <div ref={mbRef} className="value mono">
            0.00
          </div>
          <div className="label">MB served</div>
        </div>
      </div>
    </section>
  );
}
