import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import mainRouter from './routes';
import { establishConnection } from './services';

const PORT = process.env.PORT || 8080;

const main = async () => {
	await establishConnection();

	const app = express();

	app.use(express.json());
	app.use(cors());

	app.use(mainRouter);

	app.get('/ping', (_, res) => res.status(200).send("You've hit zaapbot, beep boop!"));

	app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));
};

main().catch((err) => console.log('--err', err));
