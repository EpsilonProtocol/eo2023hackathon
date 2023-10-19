import mongoose from 'mongoose';

export type UserSchema = {
	twitter?: {
		id: string;
		name: string;
		username: string;
	};
	loginNonce: number;
	walletAddress: string;
	safeWalletAddress?: string;
};

const userSchema = new mongoose.Schema<UserSchema>({
	twitter: {
		id: {
			type: String,
			unique: true,
		},
		name: {
			type: String,
		},
		username: {
			type: String,
		},
	},
	walletAddress: {
		type: String,
		required: true,
		unique: true,
	},
	safeWalletAddress: {
		type: String,
		unique: true,
	},
	loginNonce: {
		type: Number,
		required: true,
		default: 0,
	},
});

export const userModel = mongoose.model('User', userSchema);
