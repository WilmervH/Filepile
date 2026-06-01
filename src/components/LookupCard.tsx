"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface InfoResponse {
  filename: string;
  Size: number;
  uploadDate: string;
  expiring: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "expired";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function LookupCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [info, setInfo] = useState<InfoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
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
      delay: 150,
      easing: "spring(1, 80, 12, 0)",
    });
  }, [reduced]);

  useEffect(() => {
    if (!resultRef.current || !info) return;
    if (reduced) {
      resultRef.current.style.opacity = "1";
      return;
    }
    anime({
      targets: resultRef.current,
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 320,
      easing: "spring(1, 80, 14, 0)",
    });
  }, [info, reduced]);

  const shake = () => {
    if (reduced) return;
    if (inputRef.current) {
      anime({
        targets: inputRef.current,
        translateX: [
          { value: -8, duration: 60 },
          { value: 8, duration: 60 },
          { value: -6, duration: 60 },
          { value: 6, duration: 60 },
          { value: 0, duration: 60 },
        ],
        easing: "easeInOutSine",
      });
    }
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

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/info/${encodeURIComponent(value.trim())}`);
      if (res.status === 404) {
        setError("not found or expired");
        shake();
        return;
      }
      if (!res.ok) {
        setError(`error ${res.status}`);
        shake();
        return;
      }
      const data = (await res.json()) as InfoResponse;
      setInfo(data);
    } catch {
      setError("network error");
      shake();
    } finally {
      setPending(false);
    }
  };

  return (
    <section ref={cardRef} className="card">
      <h2>lookup</h2>
      <form className="lookup-form" onSubmit={handleLookup}>
        <input
          ref={inputRef}
          className="mono"
          type="text"
          placeholder="file id (e.g. aB3xZ)"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          maxLength={5}
          autoComplete="off"
          spellCheck={false}
        />
        <button className="btn" type="submit" disabled={pending || !value.trim()}>
          {pending ? "…" : "lookup"}
        </button>
      </form>
      {info && (
        <div ref={resultRef} className="lookup-result">
          <div className="filename">{info.filename}</div>
          <div className="row">
            <span>size</span>
            <span>{formatSize(info.Size)}</span>
          </div>
          <div className="row">
            <span>uploaded</span>
            <span>{new Date(info.uploadDate).toLocaleString()}</span>
          </div>
          <div className="row">
            <span>expires in</span>
            <span className="mono">{formatRemaining(info.expiring)}</span>
          </div>
          {info.expiring > 0 && (
            <a className="btn accent download" href={`/api/download/${value.trim()}`} download>
              download
            </a>
          )}
        </div>
      )}
      {error && (
        <div ref={errorRef} className="error" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}
