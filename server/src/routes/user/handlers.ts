import { ethers } from 'ethers';
import { Request, RequestHandler, Response } from 'express';
import { UserService } from '../../services';
import { verifySignature } from '../../utils/crypto.utils';
import { generateToken } from '../../utils/jwt.utils';
import { sendErrorResponse, sendSuccessResponse } from '../../utils/response.utils';

type VerifiedRequestHandler = (req: Request & { userId: string }, res: Response) => void;

export const handleLogin: RequestHandler = async (req, res) => {
	try {
		const { signature, address } = req.body;

		if (typeof address !== 'string' || !ethers.utils.isAddress(address)) return sendErrorResponse(res, new Error('Invalid address'));

		let user = await UserService.getUserFromWalletAddress(address);

		const message = {
			nonce: user?.loginNonce ?? 0,
		};

		if (!verifySignature(JSON.stringify(message), signature, address)) {
			return sendErrorResponse(res, Error('Invalid Signature'));
		}

		if (!user) user = await UserService.createUserWalletAddressIfNotExist(address);

		const accessToken = await generateToken(user._id.toString());

		user.loginNonce += 1;

		await user.save();

		return sendSuccessResponse(res, { accessToken });
	} catch (err) {
		sendErrorResponse(res, err as Error);
	}
};

export const handleUpdateUser: VerifiedRequestHandler = async (req, res) => {
	try {
		const { safeWalletAddress } = req.body;

		console.log('--userid', req.userId);

		let user;

		if (!!safeWalletAddress) user = await UserService.updateUserSafeWalletAddress(req.userId, safeWalletAddress);

		return sendSuccessResponse(res, { user });
	} catch (err) {
		sendErrorResponse(res, err as Error);
	}
};

export const handleGetNonce: RequestHandler = async (req, res) => {
	try {
		const { address } = req.query;

		if (typeof address !== 'string' || !ethers.utils.isAddress(address)) return sendErrorResponse(res, new Error('Invalid address'));

		let user = await UserService.getUserFromWalletAddress(address);

		return sendSuccessResponse(res, { nonce: !!user ? user.loginNonce : 0 });
	} catch (err) {
		return sendErrorResponse(res, err as Error);
	}
};

export const handleGetUser: VerifiedRequestHandler = async (req, res) => {
	try {
		const user = await UserService.getUserFromId(req.userId);

		if (!user) throw Error('No user found');

		return sendSuccessResponse(res, { twitter: user.twitter && { id: user.twitter.id, username: user.twitter.username }, safeWalletAddress: user.safeWalletAddress, walletAddress: user.walletAddress });
	} catch (err) {
		return sendErrorResponse(res, err as Error);
	}
};
