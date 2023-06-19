import axios from "axios";
import Express from "express";
import Logger from "./logger";

export function proxyRequest(ipfsBackend: string) {
  const logger = new Logger("ProxyRequest");
  return function (req: Express.Request, res: Express.Response) {
    logger.info(`Request received for ${req.url}`);

    logger.debug(`Request body received`);

    axios({
      method: req.method,
      url: `${ipfsBackend}${req.originalUrl}`,
      headers: {...req.headers as any, origin: 'localhost', referer: ''},
      data: req.body,
    })
      .then((proxyResponse) => {
        res
          .contentType(proxyResponse.headers["content-type"])
          .status(proxyResponse.status)
          .send(proxyResponse.data);
      })
      .catch((e) => {
        logger.error(`Failed to proxy request: ${e.message}`);
        res.contentType("text").status(500).send('Something went wrong! Please try again...');
      });
  };
}
