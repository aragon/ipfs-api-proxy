import {fromBuffer} from "file-type";

export function isAllowedMimeType(
  file: Buffer,
  allowedMimeTypes: string[]
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fromBuffer(file)
      .then((fileType) => {
        let fileTypeWithDefault = fileType || {mime: "text/plain"};
        if (fileTypeWithDefault) {
          for (const type of allowedMimeTypes) {
            const match = fileTypeWithDefault.mime.match(type);
            if (match) {
              resolve(true);
              return;
            }
          }
        }
        if (allowedMimeTypes.includes("application/json")) {
          try {
            JSON.parse(file.toString());
            resolve(true);
            return;
          } catch (e) {
            // ignore
          }
        }
        resolve(false);
      })
      .catch(() => {
        // return false in case of an error
        resolve(false);
      });
  });
}
