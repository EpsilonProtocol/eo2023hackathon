import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRY, JWT_PRIVATE_KEY } from '../config/env';

export const generateToken = (data: string): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		console.log('--tok', ACCESS_TOKEN_EXPIRY);
		jwt.sign(data, JWT_PRIVATE_KEY, (err, resp) => {
			if (err || resp === undefined) reject(err);
			else resolve(resp);
		});
	});
};

export const verifyJWT = async (req: Request & { userId: string }, res: Response, next: NextFunction) => {
	const token = req.headers['authorization'];

	if (token) {
		jwt.verify(token, JWT_PRIVATE_KEY, function (err, decoded) {
			if (err || typeof decoded !== 'string') {
				console.log('verify -- ', err);
				return res.status(401).json({ error: true, message: err?.message ?? 'Invalid JWT' });
			}
			req.userId = decoded;
			next();
		});
	} else {
		return res.status(401).send('Unauthorized');
	}
};
