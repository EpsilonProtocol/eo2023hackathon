import { RequestHandler, Router } from 'express';
import { verifyJWT } from '../../utils/jwt.utils';
import { handleGetNonce, handleGetUser, handleLogin, handleUpdateUser } from './handlers';

const userRouter = Router();

// GET routes
userRouter.get('/', verifyJWT, handleGetUser as any as RequestHandler);
userRouter.get('/nonce', handleGetNonce);

// POST routes
userRouter.post('/', verifyJWT, handleUpdateUser as any as RequestHandler);
userRouter.post('/login', handleLogin);

export default userRouter;
