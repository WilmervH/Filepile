# Graph Report - .  (2026-06-01)

## Corpus Check
- Corpus is ~11,315 words - fits in a single context window. You may not need a graph.

## Summary
- 57 nodes · 88 edges · 8 communities
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.89)
- Token cost: 76,684 input · 76,684 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Brand & Visual Identity|Brand & Visual Identity]]
- [[_COMMUNITY_App Bootstrap & Multer Config|App Bootstrap & Multer Config]]
- [[_COMMUNITY_Package Manifest Fields|Package Manifest Fields]]
- [[_COMMUNITY_Upload Flow & Expiry|Upload Flow & Expiry]]
- [[_COMMUNITY_Info Endpoint & SQL Wrappers|Info Endpoint & SQL Wrappers]]
- [[_COMMUNITY_Download & Statistics Endpoints|Download & Statistics Endpoints]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_README & Project Inspiration|README & Project Inspiration]]

## God Nodes (most connected - your core abstractions)
1. `POST /upload handler` - 9 edges
2. `initDb()` - 8 edges
3. `cleanup()` - 6 edges
4. `execute()` - 6 edges
5. `Filepile Logo Image` - 6 edges
6. `fetchFirst()` - 5 edges
7. `GET /download/:fileId handler` - 5 edges
8. `files table schema` - 5 edges
9. `statistics table schema` - 5 edges
10. `storage` - 4 edges

## Surprising Connections (you probably didn't know these)
- `FilePile features (expiring, CLI-friendly, short-term storage)` --conceptually_related_to--> `cleanup()`  [INFERRED]
  readme.md → src/index.js
- `In-memory setTimeout expiry caveat` --rationale_for--> `cleanup()`  [EXTRACTED]
  CLAUDE.md → src/index.js
- `Two DB connections at startup` --rationale_for--> `initDb()`  [EXTRACTED]
  CLAUDE.md → src/sql.js
- `In-memory setTimeout expiry caveat` --rationale_for--> `POST /upload handler`  [EXTRACTED]
  CLAUDE.md → src/index.js
- `API endpoints documentation` --references--> `POST /upload handler`  [EXTRACTED]
  readme.md → src/index.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **File upload flow** — src_index_upload_handler, src_files_generatefileid, src_files_storage, src_sql_execute, src_sql_files_table, src_index_cleanup [INFERRED 0.85]
- **Statistics tracking pattern** — src_index_upload_handler, src_index_download_handler, src_index_statistics_handler, src_sql_statistics_table [INFERRED 0.85]
- **In-memory expiry mechanism** — src_index_upload_handler, src_index_cleanup, claude_file_expiry_caveat [INFERRED 0.85]

## Communities (8 total, 0 thin omitted)

### Community 0 - "Brand & Visual Identity"
Cohesion: 0.22
Nodes (11): Filepile Brand Identity, Cartoon Illustration Style, Multi-color Palette (purple, red, blue, pink, orange, teal), File Organization, Pile Metaphor, File Organization Metaphor, Filepile Logo Image, Stack of Colorful Books (+3 more)

### Community 1 - "App Bootstrap & Multer Config"
Cohesion: 0.33
Nodes (9): FilePile Architecture overview, Two DB connections at startup, fileLimits, generateFileId(), storage, app, db, upload (+1 more)

### Community 2 - "Package Manifest Fields"
Cohesion: 0.18
Nodes (10): author, description, license, main, name, scripts, production, start (+2 more)

### Community 3 - "Upload Flow & Expiry"
Cohesion: 0.53
Nodes (6): In-memory setTimeout expiry caveat, FilePile features (expiring, CLI-friendly, short-term storage), cleanup(), POST /upload handler, execute(), files table schema

### Community 4 - "Info Endpoint & SQL Wrappers"
Cohesion: 0.50
Nodes (4): Statistics quirks (dead code, bad date), GET /info/:fileId handler, fetchFirst(), updateStatistics()

### Community 5 - "Download & Statistics Endpoints"
Cohesion: 0.50
Nodes (5): API endpoints documentation, GET /download/:fileId handler, GET /statistics handler, fetchAll(), statistics table schema

### Community 6 - "NPM Dependencies"
Cohesion: 0.40
Nodes (5): dependencies, express, multer, nodemon, sqlite3

### Community 7 - "README & Project Inspiration"
Cohesion: 0.67
Nodes (3): FilePile project README, Inspiration (privacy, CLI usability), filepile npm package manifest

## Knowledge Gaps
- **21 isolated node(s):** `upload`, `name`, `version`, `type`, `main` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST /upload handler` connect `Upload Flow & Expiry` to `App Bootstrap & Multer Config`, `Download & Statistics Endpoints`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `dependencies` connect `NPM Dependencies` to `Package Manifest Fields`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `initDb()` connect `App Bootstrap & Multer Config` to `Upload Flow & Expiry`, `Info Endpoint & SQL Wrappers`, `Download & Statistics Endpoints`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `POST /upload handler` (e.g. with `fileLimits` and `storage`) actually correct?**
  _`POST /upload handler` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `cleanup()` (e.g. with `FilePile features (expiring, CLI-friendly, short-term storage)` and `files table schema`) actually correct?**
  _`cleanup()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Filepile Logo Image` (e.g. with `Filepile Brand Identity` and `File Organization`) actually correct?**
  _`Filepile Logo Image` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `upload`, `name`, `version` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._