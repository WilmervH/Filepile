import Image from "next/image";
import { UploadCard } from "@/components/UploadCard";
import { LookupCard } from "@/components/LookupCard";
import { StatsStrip } from "@/components/StatsStrip";

export default function Page() {
  return (
    <>
      <main className="page">
        <header className="brand">
          <Image
            className="brand-logo"
            src="/filepile.png"
            alt="FilePile logo"
            width={64}
            height={64}
            priority
          />
          <div className="brand-text">
            <h1>filepile</h1>
            <p>quick, no-bs file sharing</p>
          </div>
        </header>
        <UploadCard />
        <LookupCard />
        <StatsStrip />
        <footer>made for sharing things that should disappear.</footer>
      </main>
    </>
  );
}
