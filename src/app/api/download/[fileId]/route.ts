import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { execute, fetchFirst, getDb, type FileRow } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/files";

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

  const filePath = path.join(UPLOAD_DIR, row.filename);

  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  await execute(
    db,
    `UPDATE statistics
     SET downloadCount = downloadCount + 1,
         downloadedMB = downloadedMB + ?
     WHERE id = 1;`,
    [row.size / 1048576]
  );

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as unknown as WebReadableStream;

  return new NextResponse(webStream as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(row.size),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        row.originalFilename
      )}"`,
    },
  });
}
