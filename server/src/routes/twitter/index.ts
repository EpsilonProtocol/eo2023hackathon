import { RequestHandler, Router } from "express";
import { verifyJWT } from "../../utils/jwt.utils";
import { handleConnectTwitter, handleGetTwitterUrl } from "./handlers";

const twitterRouter = Router();

twitterRouter.get("/url", handleGetTwitterUrl);
twitterRouter.post(
  "/connect",
  verifyJWT,
  handleConnectTwitter as any as RequestHandler,
);
export default twitterRouter;
