import filetype from "file-type";
import Logger from "./logger";

export function isAllowedMimeType(
  file: Buffer,
  allowedMimeTypes: string[]
): Promise<boolean> {
  const logger = new Logger("isAllowedMimeType");
  return filetype
    .fromBuffer(file)
    .then((fileType) => {
      logger.debug(`Got fileType ${fileType}`);
      let fileTypeWithDefault = fileType || { mime: "text/plain" };
      if (fileTypeWithDefault) {
        for (const type of allowedMimeTypes) {
          const match = fileTypeWithDefault.mime.match(type);
          if (match) {
            logger.info(`Filetype ${fileType?.mime} allowed`);
            return true;
          }
        }
      }
      if (allowedMimeTypes.includes("application/json")) {
        try {
          logger.info(`Filetype appcliation/json allowed`);
          JSON.parse(file.toString());
          return true;
        } catch (e) {
          // ignore
        }
      }
      logger.info(`Filetype ${fileType?.mime} not allowed!`);
      return false;
    })
    .catch(() => false);
}
