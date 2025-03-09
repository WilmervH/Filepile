import sqlite3 from "sqlite3"

export const execute = async (db, sql, params = []) => {
    if (params && params.length > 0) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  };

export const fetchAll = async (db, sql, params) => {
return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    resolve(rows);
    });
});
};

export const fetchFirst = async (db, sql, params) => {
return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
    if (err) reject(err);
    resolve(row);
    });
});
};

export const updateStatistics = async (db, statistic, value) => {
  const statisticsSql = `update statistics
                          set uploadCount = uploadCount + 1
                          where id=1;`
  const statisticsParams = [ 0, 1, 0 ]
}

export const initDb = async () => {
  const db = new sqlite3.Database("fileinfo.db")

  const createFileDb = `CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY,
      fileId TEXT NOT NULL,
      originalFilename TEXT NOT NULL,
      filename TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploadTime BIGINT NOT NULL,
      expiryTime BIGINT)`

  const createStatisticsDb = `CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY,
      downloadedMB DECIMAL(10,2) NOT NULL,
      uploadCount INTEGER NOT NULL,
      downloadCount INTEGER NOT NULL)`

  const initStatistics = `INSERT INTO statistics (downloadedMB, uploadCount, downloadCount)
                          SELECT 0, 0, 0
                          WHERE NOT EXISTS (SELECT 1 FROM statistics)`
  
  try {
      await execute(db, createFileDb)
      await execute(db, createStatisticsDb)
      await execute(db, initStatistics)
  } catch(error) {
      console.log(error)
  } finally {
      db.close()
  }
}