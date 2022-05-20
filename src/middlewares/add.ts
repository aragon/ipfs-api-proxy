import Express from "express";
import Logger from "../helpers/logger";
import multiparty from "multiparty";
import {isAllowedMimeType} from "../helpers/mimetype";

interface Error {
  statusCode: number;
  message: string;
}

export function addRouteMiddleware(
  maxBodySize: number,
  allowDirectories: boolean,
  allowedMimeTypes: string[]
): Express.Handler {
  const logger = new Logger("addRouteMiddleware");
  return (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    logger.info("Request received");
    const form = new multiparty.Form();
    let dataBuffer: Buffer;

    req.on("data", (chunk: Buffer) => {
      if (dataBuffer) {
        dataBuffer = Buffer.concat([dataBuffer, chunk]);
      } else {
        dataBuffer = chunk;
      }
    });

    form.on("part", (part) => {
      logger.debug(`Part received with name ${part.name}`);
      if (!allowDirectories) {
        if (part.headers["content-type"] == "application/x-directory") {
          form.emit("error", {
            statusCode: 400,
            message: "Directories are not allowed",
          });
        }
      }

      let file: Buffer;
      part.on("data", (chunk) => {
        if (!file) {
          file = chunk;
        } else {
          file = Buffer.concat([file, chunk]);
        }
      });
      part.on("end", () => {
        if (!file) {
          return;
        }
        isAllowedMimeType(file, allowedMimeTypes).then((allowed) => {
          if (!allowed) {
            form.emit("error", {
              statusCode: 400,
              message: "File type not allowed",
            });
          }
        });
      });
    });

    form.on("progress", (bytesReceived) => {
      logger.debug(`Received ${bytesReceived} bytes`);
      if (bytesReceived > maxBodySize) {
        form.emit("error", {
          statusCode: 413,
          message: "Request body too large",
        });
      }
    });

    form.on("close", () => {
      logger.debug(`Form closed with ${form.bytesReceived} bytes received`);
      req.body = dataBuffer;
      next();
    });

    form.on("error", (err: Error) => {
      if (!res.headersSent) {
        logger.error(`Error: ${err.message}`);
        res.status(err.statusCode).contentType("text").send(err.message);
      }
    });

    form.parse(req);
  };
}
