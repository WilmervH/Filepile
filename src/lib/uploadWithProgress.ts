export interface UploadResponse {
  message: string;
  fileId: string;
}

export interface ProgressEventInfo {
  loaded: number;
  total: number;
  lengthComputable: boolean;
}

export function uploadWithProgress(
  file: File,
  onProgress: (info: ProgressEventInfo) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (e) => {
      onProgress({
        loaded: e.loaded,
        total: e.total,
        lengthComputable: e.lengthComputable,
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadResponse);
        } catch {
          reject(new Error("Malformed server response"));
        }
      } else {
        let msg = `HTTP ${xhr.status}`;
        try {
          const body = JSON.parse(xhr.responseText) as { message?: string };
          if (body.message) msg = body.message;
        } catch {
          /* ignore */
        }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
