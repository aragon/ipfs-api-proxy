import axios from "axios";
import Express from "express";
import { isAllowedMimeType } from "../helpers/mimetype";
import Logger from "../helpers/logger";

export function pinRouteMiddlware(
  maxFileSize: number,
  allowedMimeTypes: string[],
  ipfsBackend: string
): Express.Handler {
  const logger = new Logger("pinRouteMiddleware");
  return async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const cid = req.query.arg;
      const response = await axios.post(
        `${ipfsBackend}/api/v0/cat?arg=${cid}`,
        undefined,
        { responseType: "arraybuffer" }
      );

      if (Buffer.from(response.data).byteLength === 0) {
        logger.info(
          `Buffer is empty. allowing it and ignoring the mime type check`
        );
        next();
        return;
      }

      const allowed = await isAllowedMimeType(response.data, allowedMimeTypes);
      if (!allowed) {
        res.contentType("text").status(400).send("File type not allowed");
        return;
      }

      if (Buffer.from(response.data).byteLength > maxFileSize) {
        res.contentType("text").status(400).send("File is too large");
        return;
      }
      next();
    } catch (err: any) {
      if (
        err.response &&
        err.response &&
        err.response.data &&
        err.response.data.Type === "error"
      ) {
        res.contentType("text").status(500).send("Something went wrong");
        return;
      }
      logger.error(JSON.stringify(err));
      res
        .contentType("text")
        .status(500)
        .send("Something went wrong! Please try again...");
    }
  };
}
