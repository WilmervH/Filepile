import { NextResponse } from "next/server";
import { fetchFirst, getDb } from "@/lib/db";
import type { FileRow } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const db = await getDb();
  const row = (await fetchFirst(db, "SELECT * FROM files WHERE fileId = ?", [fileId])) as
    | FileRow
    | undefined;

  if (!row) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  // uploadTime is stored in milliseconds; the pre-Next.js code had a `* 1000`
  // bug that displayed the date offset by ~50,000 years. Fixed here.
  return NextResponse.json({
    filename: row.originalFilename,
    Size: row.size,
    uploadDate: new Date(row.uploadTime).toISOString(),
    expiring: row.expiryTime - Date.now(),
  });
}
