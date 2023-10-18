'use client';

import { useAuth } from '../../components/contexts/auth/useAuth';

export default function AuthPage() {
	const { isMetamaskConnected, handleConnectMetamask } = useAuth();

	return (
		<h1>
			{!isMetamaskConnected && <button onClick={handleConnectMetamask}>Connect Metamask</button>}
			{/* {!!isMetamaskConnected && !safeWallet && <button onClick={handleCreateSafeWallet}>Create Safe Wallet</button>}
			{!!ethAdapter && !!safeWallet && <h1>Safe Wallet Created at {safeWallet}</h1>} */}
		</h1>
	);
}
