import { Router } from "express";
import twitterRouter from "./twitter";
import userRouter from "./user";

const mainRouter = Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/twitter", twitterRouter);

export default mainRouter;
