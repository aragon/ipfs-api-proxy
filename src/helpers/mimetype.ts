import {fromBuffer} from "file-type";

export async function isAllowedMimeType(
  file: Buffer,
  allowedMimeTypes: string[]
): Promise<boolean> {
  const fileType = (await fromBuffer(file)) || {mime: "text/plain"};
  if (fileType) {
    for (const type of allowedMimeTypes) {
      const match = fileType.mime.match(type);
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
}
