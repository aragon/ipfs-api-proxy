import * as dotenv from "dotenv";
dotenv.config();

import Logger from "./helpers/logger";
import Express from "express";
import { addRouteMiddleware } from "./middlewares/add";
import { proxyRequest } from "./helpers/proxyRequest";
import { apiAuth } from "./middlewares/apiAuth";
import { pinRouteMiddlware } from "./middlewares/pin";

const logger = new Logger("main");

logger.debug("Adding routes");

const ipfsBackend = process.env.IPFS_BACKEND || "http://127.0.0.1:5001";
const maxBodySize = parseInt(process.env.MAX_BODY_SIZE || "10485760"); // 1024 * 1024 * 10 as default value
const allowDirectories = process.env.ALLOW_DIRECTORIES === "true";
const allowedMimeTypes =
  process.env.ALLOWED_MIMETYPES?.split(",").map((type) => type.trim()) ||
  [".*"];
const allowedApiKeys =
  process.env.ALLOWED_API_KEYS?.split(",").map((key) => key.trim()) || [];

logger.info(`IPFS backend: ${ipfsBackend}`);
logger.info(`Max body size: ${maxBodySize} bytes`);
logger.info(`Allow directories: ${allowDirectories}`);
logger.info(`Allowed mime types: ${allowedMimeTypes}`);
logger.info(`Allowed api keys: ${allowedApiKeys.length}`);

const app = Express();
app.post(
  "/api/v0/add",
  apiAuth(allowedApiKeys),
  addRouteMiddleware(maxBodySize, allowDirectories, allowedMimeTypes),
  proxyRequest(ipfsBackend),
);

app.post("/api/v0/cat", apiAuth(allowedApiKeys), proxyRequest(ipfsBackend));
app.post("/api/v0/get", apiAuth(allowedApiKeys), proxyRequest(ipfsBackend));

app.post("/api/v0/id", apiAuth(allowedApiKeys), proxyRequest(ipfsBackend));

app.post(
  "/api/v0/pin/add",
  apiAuth(allowedApiKeys),
  pinRouteMiddlware(maxBodySize, allowedMimeTypes, ipfsBackend),
  proxyRequest(ipfsBackend),
);

app.listen(process.env.PORT, () => {
  logger.info(`Server listening on port ${process.env.PORT}`);
});
