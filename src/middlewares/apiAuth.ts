import Express from "express";
import Logger from "../helpers/logger";

export function apiAuth(allowedKeys: string[]) {
  const logger = new Logger("apiAuth");
  return function (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) {
    logger.debug(`Request received for ${req.url}`);
    if (allowedKeys.length === 0) {
      logger.debug("No API keys defined... allowing");
      next();
      return;
    }

    const key = req.header("X-API-KEY");
    if (key && allowedKeys.includes(key)) {
      logger.debug(`API key is allowed`);
      next();
      return;
    }

    logger.error(`API key is not allowed`);
    res.contentType("text").status(401).send("Unauthorized");
  };
}
