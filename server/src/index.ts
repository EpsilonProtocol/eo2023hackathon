import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";

import mainRouter from "./routes";
import { establishConnection } from "./services";
import { Bot } from "./services/bot.service";

const PORT = process.env.PORT || 8080;

const main = async () => {
  await establishConnection();

  const app = express();
  const bot = new Bot();

  app.use(express.json());
  app.use(cors());

  app.use(mainRouter);

  app.get("/ping", (_, res) =>
    res.status(200).send("You've hit zaapbot, beep boop!"),
  );

  app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));

  // await bot.init();
};

main().catch((err) => console.log("--err", err));
