"use client";

import { useGetTwitterUrlQuery } from "@/services/twitter-service";
import { useAuth } from "../../components/contexts/auth/useAuth";

export default function AuthPage() {
  const {
    isAuthorized,
    isMetamaskConnected,
    handleConnectMetamask,
    handleCreateSafeWallet,
    userData,
  } = useAuth();

  const { data } = useGetTwitterUrlQuery();

  return (
    <h1>
      {!isMetamaskConnected && (
        <button onClick={handleConnectMetamask}>Connect Metamask</button>
      )}
      {!!isMetamaskConnected &&
        !!isAuthorized &&
        !userData?.safeWalletAddress && (
          <button onClick={handleCreateSafeWallet}>Create Safe Wallet</button>
        )}
      {!!isMetamaskConnected &&
        !!isAuthorized &&
        !!userData?.safeWalletAddress &&
        data &&
        typeof data !== "string" && (
          <p>
            <h1>Safe Wallet Created at {userData.safeWalletAddress}</h1>
            <a href={data.url}>Connect Twitter</a>
          </p>
        )}
    </h1>
  );
}
