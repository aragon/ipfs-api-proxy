import filetype from "file-type";
import Logger from "./logger";

export function isAllowedMimeType(
  file: Buffer,
  allowedMimeTypes: string[],
  filename: string = ""
): Promise<boolean> {
  const logger = new Logger("isAllowedMimeType");
  return filetype
    .fromBuffer(file)
    .then((fileType) => {
      logger.debug(`Got fileType ${fileType}`);
      let fileTypeWithDefault: string | undefined = fileType?.mime;
  
      if (!fileTypeWithDefault) {
        const extension = filename.split(".").pop();
        logger.debug(`Found file extension .${extension}`)
        switch (extension) {
          case "json":
            try {
              JSON.parse(file.toString());
              fileTypeWithDefault = "application/json";
              break;
            } catch (e) {
              // ignore
            }
          default:
            fileTypeWithDefault = "text/plain";
        }
      }

      if (fileTypeWithDefault) {
        for (const type of allowedMimeTypes) {
          const match = fileTypeWithDefault.match(type);
          if (match) {
            logger.info(`Filetype ${fileTypeWithDefault} allowed`);
            return true;
          }
        }
      }
      logger.info(`Filetype ${fileTypeWithDefault} not allowed!`);
      return false;
    })
    .catch(() => false);
}
