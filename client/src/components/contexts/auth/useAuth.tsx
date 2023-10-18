'use client';

import { EthersAdapter, SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import _ from 'lodash';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLazyGetNonceQuery, useLoginMutation } from '../../../services/user-service';

declare global {
	interface Window {
		ethereum: any;
	}
}

type User = {};

type Wallet = {};

type AuthContext = {
	handleConnectMetamask: () => Promise<void>;
	isMetamaskConnected: boolean;
};

const authContext = createContext<AuthContext>({
	handleConnectMetamask: async () => {},
	isMetamaskConnected: false,
});

type AuthContextProviderProps = {
	children: JSX.Element | JSX.Element[] | string | ReactNode;
};

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [ethAdapter, setEthAdapter] = useState<EthersAdapter>();
	const [safeWalletAddress, setSafeWalletAddress] = useState<string>();

	const [getUserNonce, nonceData, data] = useLazyGetNonceQuery();
	const [login, loginErr] = useLoginMutation();

	useEffect(() => {
		if (_.isString(loginErr.data)) return console.log('--login error', loginErr);
	}, [loginErr]);

	useEffect(() => {
		(async () => {
			if (!ethAdapter || !nonceData || !nonceData.isSuccess || !nonceData?.currentData) return;

			const address = await ethAdapter.getSignerAddress();

			if (!address) return;

			if (_.isString(nonceData.currentData)) return console.log('--get nonce error', nonceData);

			const signer = ethAdapter.getSigner();

			if (!signer) return console.log('--error getting signer');

			const signature = await signer.signMessage(JSON.stringify(nonceData.currentData));

			if (!signature) return console.log('--user rejected signature');

			console.log({ signature, address });

			await login({ signature, address });
		})();
	}, [ethAdapter, nonceData, login, data]);

	useEffect(() => {
		(async () => {
			if (!ethAdapter) return;

			const address = await ethAdapter.getSignerAddress();

			if (!address) return;

			await getUserNonce(address);
		})();
	}, [ethAdapter, getUserNonce]);

	const handleConnectMetamask = useCallback(async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		await provider.send('eth_requestAccounts', []);

		let signer = provider.getSigner();

		if ((await signer.getChainId()) !== 5) {
			await provider.send('wallet_switchEthereumChain', [{ chainId: '0x5' }]);

			await provider.send('eth_requestAccounts', []);

			signer = provider.getSigner();
		}

		setEthAdapter(
			new EthersAdapter({
				ethers,
				signerOrProvider: signer,
			})
		);
	}, []);

	const handleCreateSafeWallet = useCallback(async () => {
		if (!ethAdapter) return alert('NO ETH ADAPTER');

		const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });

		const safeAccountConfig: SafeAccountConfig = {
			owners: [(await ethAdapter.getSignerAddress()) ?? ''],
			threshold: 1,
		};

		const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });

		const safeAddress = await safeSdkOwner1.getAddress();

		console.log('Your Safe has been deployed:');
		console.log(`https://goerli.etherscan.io/address/${safeAddress}`);
		console.log(`https://app.safe.global/gor:${safeAddress}`);

		setSafeWalletAddress(safeAddress);
	}, [ethAdapter]);

	const isMetamaskConnected = useMemo<boolean>(() => !!ethAdapter, [ethAdapter]);

	return <authContext.Provider value={{ handleConnectMetamask, isMetamaskConnected }}>{children}</authContext.Provider>;
}

export const useAuth = () => {
	const data = useContext(authContext);

	return data;
};
