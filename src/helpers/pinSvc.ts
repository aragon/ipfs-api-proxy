import axios, { AxiosRequestConfig } from "axios";
import Express from "express";
import Logger from "./logger";

export type Pin = {
  cid: string;
  name?: string;
  origins?: string[]; // multiaddress list
  meta?: { [index: string]: string };
};

export function pin(pinSvcBackend: string, pinSvcAuth: string) {
  const logger = new Logger("PinSvc.Pin");
  if (!pinSvcBackend) {
    logger.info("No pinning backend defined... Using fallback");
    return (
      req: Express.Request,
      res: Express.Response,
      next: Express.NextFunction
    ) => next();
  }

  return async (req: Express.Request, res: Express.Response) => {
    logger.info(`Request recieved..`);
    try {
      if (!req.query || !req.query.arg) {
        logger.warn(`Missing CID`);
        res.status(400).send("Missing CID");
        return;
      }
      const cid = req.query.arg || "";

      const pinObj: Pin = {
        cid: cid as string, // typecasting because express allows other datatypes than strings
        meta: {
          creator: req.headers.origin || "",
        },
      };

      const options: AxiosRequestConfig = {};

      const [username, password] = pinSvcAuth.split(":");
      if (username && password) {
        logger.debug("Using basic auth");
        options.auth = {
          username,
          password,
        };
      }

      logger.info(`Trying to pin ${cid}`);
      const resp = await axios.post(`${pinSvcBackend}/pins`, pinObj, options);
      if (resp.status === 200) {
        logger.info(`CID ${cid} pinned`);
        logger.debug(`Pinning service response: ${JSON.stringify(resp.data)}`);
        // mimiking ipfs pin api response
        res.status(200).send({
          Pins: [cid],
        });
        return;
      }
      logger.warn(
        `Request responded with ${resp.status} instead of 200. Forwarding raw request`
      );
      res
        .contentType(resp.headers["content-type"])
        .status(resp.status)
        .send(resp.data);
    } catch (e: any) {
      logger.error(`Request failed: ${e.message}`);
      res.contentType("text").status(500).send(e.message);
    }
  };
}
