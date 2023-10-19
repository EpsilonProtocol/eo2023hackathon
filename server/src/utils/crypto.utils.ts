import { ethers } from 'ethers';

export const verifySignature = (message: string, signature: string, address: string): boolean => {
	const signatureProvider = ethers.utils.verifyMessage(message, signature);

	return signatureProvider === address;
};
