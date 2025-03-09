import multer from "multer"
import express from "express"
import sqlite3 from "sqlite3"
import { unlink } from 'fs'

import { execute, fetchAll, fetchFirst, initDb } from "./sql.js"
import { storage, fileLimits, generateFileId } from "./files.js"


const app = express()
const port = 3000;
const upload = multer({ storage: storage, limits: fileLimits})

initDb()
const db = new sqlite3.Database("fileinfo.db")

        /*
            UPLOAD
        */

app.post("/upload", upload.single("file"), async (req, res, next) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

        const fileId = generateFileId()
        const originalFilename = req.file.originalname
        const filename = req.file.filename
        const size = req.file.size
        const uploadTime = Date.now()
        const expiryTime = Date.now() + 1000 * 60 * 10 // 10 minutes

        const sql = `INSERT INTO files (fileId, originalFilename, filename, size, uploadTime, expiryTime) VALUES (?, ?, ?, ?, ?, ?)`
        const params = [ fileId, originalFilename, filename, size, uploadTime, expiryTime ]
        await execute(db, sql, params)
        
        const statisticsSql = `UPDATE statistics
                          SET uploadCount = uploadCount + 1
                          WHERE id=1;`
        await execute(db, statisticsSql)

        const filePath = `./uploads/${filename}`
        const timeoutId = setTimeout(() => {cleanup(fileId, filePath)}, (expiryTime - uploadTime))

        res.status(201).json(
            {message: "File uploaded successfully",
            fileId: fileId});
    } catch (error) {
        res.status(500).json({ message: `Error uploading file` });
        console.error(`Error uploading file: ${error.message}`)
    }
});

        /*
            DOWNLOAD
        */

app.get("/download/:fileId", async (req, res, next) => {
    const { fileId } = req.params

    const sql = `SELECT * FROM files WHERE fileId = ?`
    const params = [ fileId ]
    const rawFileInfo = await fetchFirst(db, sql, params)

    if (!rawFileInfo) {
        return res.status(404).json({ message: "File not found"})
    }

    const filePath = `./uploads/${rawFileInfo.filename}`

    try {
        res.download(filePath, rawFileInfo.originalFilename)
        const statisticsSql = `UPDATE statistics
                          SET downloadCount = downloadCount + 1,
                          downloadedMB = downloadedMB + ?
                          WHERE id=1;`
        const statisticsParams = [ rawFileInfo.size / 1048576 ]
        await execute(db, statisticsSql, statisticsParams)
    } catch (error) {
        res.status(500).json({ message: "Error downloading" })
        console.error(`Error uploading file: ${error.message}`)
    }
    
    
})

        /*
            INFO
        */

app.get("/info/:fileId", async (req, res, next) => {
    const { fileId } = req.params

    const sql = `SELECT * FROM files WHERE fileId = ?`
    const params = [ fileId ]
    const rawFileInfo = await fetchFirst(db, sql, params)

    if (!rawFileInfo) {
        return res.status(404).json({ message: "File not found"})
    }

    const fileInfo = {
        filename: rawFileInfo.originalFilename,
        Size: rawFileInfo.size,
        uploadDate: new Date(rawFileInfo.uploadTime * 1000),
        expiring: (rawFileInfo.expiryTime - Date.now())
    }

    try {
        res.status(201).send(fileInfo)
    } catch (error) {
        res.status(500).send({ message: "Error getting info" });
    }
})

        /*
            STATISTICS
        */

app.get("/statistics", async (req, res, next) => {
    const statistics = await fetchAll(db, "SELECT * FROM statistics;")

    const prettyStatistics = {
        uploadCount: statistics[0].uploadCount,
        downloadCount: statistics[0].downloadCount,
        downloadedMB: statistics[0].downloadedMB
    }

    try {
        res.status(201).json(prettyStatistics)
    } catch (error) {
        res.status(500).json({ message: "Error getting stats" });
    }
})

        /*
            CLEANUP
        */

const cleanup = async (fileId, filepath) => {
    unlink(filepath, (err) => {
        if (err) console.error(`Error deleting file: ${filepath}: ${err.message}`)
    })

    const sql = "DELETE FROM files WHERE fileId=?"
    const params = [ fileId ]
    await execute(db, sql, params)
}

  
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});