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
- usable from a cli

## Usage
FilePile can be used from the command line with curl or from scripts and other applications. Here I go over the basic usage with curl.
### Uploading a file
````
curl -X POST \
    -F "file=@</path/to/file>" \
    http://hostname:3000/upload
````
### Getting file info
````
curl -X GET \
    http://hostname:3000/info/<file id>
````
### Downloading a file
````
curl -X GET \
    http://hostname:3000/download/<file id> \
    --output <file>
````
### Checking statistics
````
curl -X GET \
    http://hostname:3000/statistics
````

> [!NOTE]
> The server will always respond with JSON. 

## Endpoints
- POST: `/upload`
    - upload a file.
    - returns with the file id needed for other functionality and sharing.
- GET: `/info/<file id>`
    - returns information about the file.
        - filename
        - size of file (in bytes)
        - time of upload
        - time till expiry
- GET: `/download/<file id>`
    - returns the actual file.
- GET: `/statistics`
    - reutrns useful (or at least cool) statistics about this instance.
        - files uploaded
        - files downloaded 
        - megabytes downloaded

## Inspiration
I am cautious of relying on random seemingly good-willing file hosts on the internet. I want to be sure that my data is private, especially when sharing sensitive information such as SSH keys. I also didn't like that almost none of these online tools were easily usable from a command line. This led to me building FilePile.

## Installation
- Clone the repo
- run `npm run production` in the `/src` folder

## Development
Feel free to contribute. Use `npm start` for the development server.