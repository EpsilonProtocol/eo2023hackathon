import cors from 'cors';
import express from 'express';
import mainRouter from './routes';

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors());

app.use(mainRouter);

app.get('/ping', (_, res) => res.status(200).send("You've hit zaapbot, beep boop!"));

app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));
