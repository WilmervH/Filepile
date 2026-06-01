"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { ResultCard } from "./ResultCard";
import { uploadWithProgress } from "@/lib/uploadWithProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Phase =
  | { kind: "idle" }
  | { kind: "uploading"; filename: string; size: number; pct: number; computable: boolean }
  | { kind: "success"; fileId: string; filename: string; size: number; expiringMs: number }
  | { kind: "error"; message: string };

export function UploadCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const indeterminateAnimRef = useRef<anime.AnimeInstance | null>(null);
  const gradientAnimRef = useRef<anime.AnimeInstance | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
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
      delay: 60,
      easing: "spring(1, 80, 12, 0)",
    });
  }, [reduced]);

  useEffect(() => {
    if (!dropzoneRef.current || reduced) return;
    anime({
      targets: dropzoneRef.current,
      scale: dragging ? 1.03 : 1,
      duration: 280,
      easing: "spring(1, 70, 14, 0)",
    });
  }, [dragging, reduced]);

  useEffect(() => {
    if (phase.kind !== "uploading" || !barFillRef.current) {
      gradientAnimRef.current?.pause();
      indeterminateAnimRef.current?.pause();
      return;
    }
    if (reduced) {
      barFillRef.current.style.width = `${Math.round(phase.pct * 100)}%`;
      return;
    }
    if (phase.computable) {
      anime({
        targets: barFillRef.current,
        width: `${Math.round(phase.pct * 100)}%`,
        duration: 240,
        easing: "easeOutQuad",
      });
      gradientAnimRef.current?.pause();
      if (!gradientAnimRef.current || gradientAnimRef.current.paused) {
        gradientAnimRef.current = anime({
          targets: barFillRef.current,
          backgroundPosition: ["0% 50%", "100% 50%"],
          duration: 3200,
          easing: "linear",
          loop: true,
        });
      }
    } else if (!indeterminateAnimRef.current) {
      barFillRef.current.style.width = "35%";
      indeterminateAnimRef.current = anime({
        targets: barFillRef.current,
        translateX: ["-30%", "230%"],
        duration: 1400,
        easing: "easeInOutQuad",
        loop: true,
      });
    }
  }, [phase, reduced]);

  const handleFile = async (file: File) => {
    if (!file) return;
    setPhase({ kind: "uploading", filename: file.name, size: file.size, pct: 0, computable: true });
    try {
      const res = await uploadWithProgress(file, (info) => {
        setPhase((prev) =>
          prev.kind === "uploading"
            ? {
                ...prev,
                pct: info.lengthComputable ? info.loaded / info.total : prev.pct,
                computable: info.lengthComputable,
              }
            : prev
        );
      });
      // brief 100% pulse before morphing into the success card
      if (barFillRef.current && !reduced) {
        anime({
          targets: barFillRef.current,
          width: "100%",
          duration: 180,
          easing: "easeOutQuad",
        });
        anime({
          targets: barFillRef.current,
          scaleY: [
            { value: 1.6, duration: 130 },
            { value: 1, duration: 200 },
          ],
          easing: "spring(1, 70, 12, 0)",
        });
      }
      // fetch the expiry window from /info so we don't hardcode it client-side
      const infoRes = await fetch(`/api/info/${res.fileId}`).catch(() => null);
      let expiringMs = 10 * 60 * 1000;
      if (infoRes && infoRes.ok) {
        const info = (await infoRes.json()) as { expiring: number };
        expiringMs = info.expiring;
      }
      setTimeout(() => {
        setPhase({
          kind: "success",
          fileId: res.fileId,
          filename: file.name,
          size: file.size,
          expiringMs,
        });
      }, reduced ? 0 : 340);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setPhase({ kind: "error", message });
      shakeError();
    }
  };

  const shakeError = () => {
    if (!cardRef.current || reduced) return;
    anime({
      targets: cardRef.current,
      translateX: [
        { value: -8, duration: 60 },
        { value: 8, duration: 60 },
        { value: -6, duration: 60 },
        { value: 6, duration: 60 },
        { value: 0, duration: 60 },
      ],
      easing: "easeInOutSine",
    });
    if (errorRef.current) {
      anime.remove(errorRef.current);
      anime({
        targets: errorRef.current,
        opacity: [0, 1],
        duration: 220,
        easing: "easeOutQuad",
      });
    }
  };

  const reset = () => {
    setPhase({ kind: "idle" });
  };

  return (
    <section ref={cardRef} className="card">
      <h2>upload</h2>
      {phase.kind === "success" ? (
        <ResultCard
          fileId={phase.fileId}
          filename={phase.filename}
          size={phase.size}
          expiringMs={phase.expiringMs}
          onReset={reset}
        />
      ) : (
        <div
          ref={dropzoneRef}
          className={`dropzone${dragging ? " dragging" : ""}`}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          {phase.kind === "uploading" ? (
            <div className="upload-status">
              <div className="filename">{phase.filename}</div>
              {phase.computable ? (
                <div className="percent mono">{Math.round(phase.pct * 100)}%</div>
              ) : (
                <div className="percent mono">uploading…</div>
              )}
            </div>
          ) : (
            <>
              <p>drop a file here</p>
              <p className="hint">or click to choose · max 100 MB</p>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                disabled={phase.kind !== "idle" && phase.kind !== "error"}
              />
            </>
          )}
          <div className={`progress${phase.kind === "uploading" && !phase.computable ? " indeterminate" : ""}`}>
            <div ref={barFillRef} className="bar-fill" />
          </div>
        </div>
      )}
      {phase.kind === "error" && (
        <div ref={errorRef} className="error" role="alert">
          {phase.message}
        </div>
      )}
    </section>
  );
}
