import axios from "axios";
import Express from "express";
import Logger from "./logger";

export function proxyRequest(ipfsBackend: string) {
  const logger = new Logger("ProxyRequest");
  return async function (req: Express.Request, res: Express.Response) {
    logger.info(`Request received for ${req.url}`);

    logger.debug(`Request body received`);
    try {
      const proxyResponse = await axios({
        method: req.method,
        url: `${ipfsBackend}${req.originalUrl}`,
        headers: req.headers as any,
        data: req.body,
      });
      res
        .contentType(proxyResponse.headers["content-type"])
        .status(proxyResponse.status)
        .send(proxyResponse.data);
    } catch (e: any) {
      logger.error(`Failed to proxy request: ${e.message}`);
      res.contentType("text").status(500).send(e);
    }
  };
}
