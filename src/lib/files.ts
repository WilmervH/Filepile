import { unlink } from "node:fs/promises";
import path from "node:path";
import { execute, getDb } from "./db";

export const EXPIRY_MS = 1000 * 60 * 10;
export const MAX_UPLOAD_BYTES = 100_000_000;
export const UPLOAD_DIR = "uploads";

const ID_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const ID_LENGTH = 5;

export function generateFileId(): string {
  let result = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    result += ID_ALPHABET.charAt(Math.floor(Math.random() * ID_ALPHABET.length));
  }
  return result;
}

export async function cleanup(fileId: string, onDiskFilename: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, onDiskFilename);
  try {
    await unlink(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
  const db = await getDb();
  await execute(db, "DELETE FROM files WHERE fileId=?", [fileId]);
}

export function scheduleCleanup(fileId: string, onDiskFilename: string, delayMs: number): void {
  setTimeout(() => {
    cleanup(fileId, onDiskFilename).catch((err) => {
      console.error(`Cleanup failed for ${fileId}:`, err);
    });
  }, delayMs);
}
