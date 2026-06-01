import { NextResponse } from "next/server";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ReadableStream as NodeReadableStream } from "node:stream/web";
import { execute, getDb } from "@/lib/db";
import {
  EXPIRY_MS,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  generateFileId,
  scheduleCleanup,
} from "@/lib/files";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileField = formData.get("file");

    if (!fileField || typeof fileField === "string") {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const file = fileField as File;
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { message: `File exceeds maximum size of ${MAX_UPLOAD_BYTES} bytes` },
        { status: 413 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const fileId = generateFileId();
    const onDiskFilename = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, onDiskFilename);

    await pipeline(
      Readable.fromWeb(file.stream() as NodeReadableStream),
      createWriteStream(filePath)
    );

    const uploadTime = Date.now();
    const expiryTime = uploadTime + EXPIRY_MS;

    const db = await getDb();
    await execute(
      db,
      `INSERT INTO files (fileId, originalFilename, filename, size, uploadTime, expiryTime) VALUES (?, ?, ?, ?, ?, ?)`,
      [fileId, file.name, onDiskFilename, file.size, uploadTime, expiryTime]
    );
    await execute(
      db,
      `UPDATE statistics SET uploadCount = uploadCount + 1 WHERE id = 1;`
    );

    scheduleCleanup(fileId, onDiskFilename, EXPIRY_MS);

    return NextResponse.json(
      { message: "File uploaded successfully", fileId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json({ message: "Error uploading file" }, { status: 500 });
  }
}
