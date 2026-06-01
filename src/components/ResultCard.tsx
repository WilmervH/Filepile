"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface ResultCardProps {
  fileId: string;
  filename: string;
  size: number;
  expiringMs: number;
  onReset?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function ResultCard({ fileId, filename, size, expiringMs, onReset }: ResultCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idCharsRef = useRef<HTMLDivElement>(null);
  const [remainingMs, setRemainingMs] = useState(Math.max(0, expiringMs));
  const [copied, setCopied] = useState(false);
  const copyFeedbackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;
    if (reduced) {
      containerRef.current.style.opacity = "1";
      return;
    }
    anime({
      targets: containerRef.current,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 360,
      easing: "spring(1, 80, 12, 0)",
    });
    if (idCharsRef.current) {
      anime({
        targets: idCharsRef.current.querySelectorAll("span"),
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(45, { start: 120 }),
        duration: 380,
        easing: "easeOutBack",
      });
    }
  }, [reduced]);

  useEffect(() => {
    const start = Date.now();
    const initial = Math.max(0, expiringMs);
    const tick = () => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, initial - elapsed);
      setRemainingMs(left);
      if (left <= 0) clearInterval(handle);
    };
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
  }, [expiringMs]);

  const downloadUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/download/${fileId}`
      : `/api/download/${fileId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
    } catch {
      /* best effort */
    }
    setCopied(true);
    if (!reduced && containerRef.current) {
      anime({
        targets: containerRef.current,
        rotate: [
          { value: -1.5, duration: 80 },
          { value: 1.5, duration: 100 },
          { value: 0, duration: 100 },
        ],
        easing: "easeInOutSine",
      });
    }
    if (copyFeedbackRef.current) {
      anime.remove(copyFeedbackRef.current);
      anime({
        targets: copyFeedbackRef.current,
        opacity: [
          { value: 1, duration: reduced ? 0 : 160 },
          { value: 1, duration: 900 },
          { value: 0, duration: reduced ? 0 : 240 },
        ],
        easing: "linear",
        complete: () => setCopied(false),
      });
    }
  };

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div ref={containerRef} className="result">
      <div className="meta mono">file id</div>
      <div ref={idCharsRef} className="id mono">
        {fileId.split("").map((c, i) => (
          <span key={`${c}-${i}`}>{c}</span>
        ))}
      </div>
      <div className="meta">
        <strong>{filename}</strong> · {formatSize(size)}
      </div>
      <div className="countdown mono">
        <span className="digit">{pad(minutes)}</span>:
        <span className="digit">{pad(seconds)}</span>
      </div>
      <div className="meta">expires in</div>
      <div className="actions">
        <button className="btn accent" onClick={handleCopy}>
          copy share link
        </button>
        {onReset && (
          <button className="btn ghost" onClick={onReset}>
            upload another
          </button>
        )}
      </div>
      <div ref={copyFeedbackRef} className="copy-feedback" aria-live="polite">
        {copied ? "copied to clipboard" : ""}
      </div>
    </div>
  );
}
