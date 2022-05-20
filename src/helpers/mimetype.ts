import {fromBuffer} from "file-type";

export function isAllowedMimeType(
  file: Buffer,
  allowedMimeTypes: string[]
): Promise<boolean> {
  return fromBuffer(file)
    .then((fileType) => {
      let fileTypeWithDefault = fileType || {mime: "text/plain"};
      if (fileTypeWithDefault) {
        for (const type of allowedMimeTypes) {
          const match = fileTypeWithDefault.mime.match(type);
          if (match) {
            return true;
          }
        }
      }
      if (allowedMimeTypes.includes("application/json")) {
        try {
          JSON.parse(file.toString());
          return true;
        } catch (e) {
          // ignore
        }
      }
      return false;
    })
    .catch(() => false);
}
