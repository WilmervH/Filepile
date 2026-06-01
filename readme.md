<p align="center">
    <img  src="assets/Filepile.png" width="250" height="250">
</p>

<span align="center">
  <h1>FilePile</h1>
  <h4>a quick, no-BS filesharing platform</h4>
</span>

## Features
- short term storage for quickly sharing files
- expiring files that are _actually_ deleted (default 10min)
- easy-to-share links
- usable from a cli **or** from the web UI

## Web UI
Open `http://hostname:3000/` in any browser. Drag a file onto the drop zone, watch the progress bar fill, and copy the share link from the result card. The same page exposes lookup and live statistics.

## CLI usage
FilePile can also be used from the command line with curl or from scripts. The API lives under `/api/`.

### Uploading a file
````
curl -X POST \
    -F "file=@</path/to/file>" \
    http://hostname:3000/api/upload
````
### Getting file info
````
curl -X GET \
    http://hostname:3000/api/info/<file id>
````
### Downloading a file
````
curl -X GET \
    http://hostname:3000/api/download/<file id> \
    --output <file>
````
### Checking statistics
````
curl -X GET \
    http://hostname:3000/api/statistics
````

> [!NOTE]
> The API always responds with JSON (except `/api/download`, which streams the file).

## Endpoints
- POST: `/api/upload`
    - upload a file.
    - returns with the file id needed for other functionality and sharing.
- GET: `/api/info/<file id>`
    - returns information about the file.
        - filename
        - size of file (in bytes)
        - time of upload
        - time till expiry (in milliseconds)
- GET: `/api/download/<file id>`
    - returns the actual file with its original filename.
- GET: `/api/statistics`
    - returns useful (or at least cool) statistics about this instance.
        - files uploaded
        - files downloaded
        - megabytes downloaded

## Inspiration
I am cautious of relying on random seemingly good-willing file hosts on the internet. I want to be sure that my data is private, especially when sharing sensitive information such as SSH keys. I also didn't like that almost none of these online tools were easily usable from a command line. This led to me building FilePile.

## Installation
- Clone the repo
- `cd src && npm install`
- `npm run build && npm start`

## Development
Feel free to contribute. Run `npm run dev` in `/src` for the Next.js dev server.