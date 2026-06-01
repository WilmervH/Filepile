import sqlite3 from "sqlite3";

const DB_PATH = "fileinfo.db";

declare global {
  // eslint-disable-next-line no-var
  var __filepileDb: sqlite3.Database | undefined;
  // eslint-disable-next-line no-var
  var __filepileDbInit: Promise<void> | undefined;
}

export const execute = (db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<void> => {
  if (params.length > 0) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => (err ? reject(err) : resolve()));
    });
  }
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
};

export const fetchAll = <T = Record<string, unknown>>(
  db: sqlite3.Database,
  sql: string,
  params: unknown[] = []
): Promise<T[]> =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });

export const fetchFirst = <T = Record<string, unknown>>(
  db: sqlite3.Database,
  sql: string,
  params: unknown[] = []
): Promise<T | undefined> =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row as T | undefined)));
  });

async function bootstrap(db: sqlite3.Database): Promise<void> {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY,
      fileId TEXT NOT NULL,
      originalFilename TEXT NOT NULL,
      filename TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploadTime BIGINT NOT NULL,
      expiryTime BIGINT)`
  );
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY,
      downloadedMB DECIMAL(10,2) NOT NULL,
      uploadCount INTEGER NOT NULL,
      downloadCount INTEGER NOT NULL)`
  );
  await execute(
    db,
    `INSERT INTO statistics (downloadedMB, uploadCount, downloadCount)
     SELECT 0, 0, 0 WHERE NOT EXISTS (SELECT 1 FROM statistics)`
  );
}

export async function getDb(): Promise<sqlite3.Database> {
  if (!global.__filepileDb) {
    global.__filepileDb = new sqlite3.Database(DB_PATH);
    global.__filepileDbInit = bootstrap(global.__filepileDb);
  }
  await global.__filepileDbInit;
  return global.__filepileDb;
}

export interface FileRow {
  id: number;
  fileId: string;
  originalFilename: string;
  filename: string;
  size: number;
  uploadTime: number;
  expiryTime: number;
}

export interface StatisticsRow {
  id: number;
  downloadedMB: number;
  uploadCount: number;
  downloadCount: number;
}
