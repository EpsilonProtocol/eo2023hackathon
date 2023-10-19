import { Router } from 'express';
import { handleGetNonce, handleLogin } from './handlers';

const userRouter = Router();

// GET routes
userRouter.get('/nonce', handleGetNonce);

// POST routes
userRouter.post('/login', handleLogin);

export default userRouter;
