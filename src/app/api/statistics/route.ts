import { NextResponse } from "next/server";
import { fetchFirst, getDb } from "@/lib/db";
import type { StatisticsRow } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const row = (await fetchFirst(db, "SELECT * FROM statistics WHERE id = 1")) as
    | StatisticsRow
    | undefined;

  if (!row) {
    return NextResponse.json(
      { uploadCount: 0, downloadCount: 0, downloadedMB: 0 },
      { status: 200 }
    );
  }

  return NextResponse.json({
    uploadCount: row.uploadCount,
    downloadCount: row.downloadCount,
    downloadedMB: row.downloadedMB,
  });
}
