export type GetUserResponse = {
  walletAddress: string;
  safeWalletAddress?: string;
  twitter: {
    username: string;
    id: string;
  };
};

export type GetNonceResponse = {
  nonce: number;
};

export type LoginResponse = {
  accessToken: string;
};
