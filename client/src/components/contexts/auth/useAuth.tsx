"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import {
  EthersAdapter,
  SafeAccountConfig,
  SafeFactory,
} from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import _ from "lodash";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useGetUserQuery,
  useLazyGetNonceQuery,
  useLoginMutation,
  useUpdateUserMutation,
} from "../../../services/user-service";

declare global {
  interface Window {
    ethereum: any;
  }
}

type User = {
  walletAddress: string;
  safeWalletAddress?: string;
  twitter: {
    username: string;
    id: string;
  };
};

type AuthContext = {
  handleCreateSafeWallet: () => Promise<void>;
  handleConnectMetamask: () => Promise<void>;
  isMetamaskConnected: boolean;
  isAuthorized: boolean;
  userData?: User;
};

const authContext = createContext<AuthContext>({
  isAuthorized: false,
  handleCreateSafeWallet: async () => {},
  handleConnectMetamask: async () => {},
  isMetamaskConnected: false,
});

type AuthContextProviderProps = {
  children: JSX.Element | JSX.Element[] | string | ReactNode;
};

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [ethAdapter, setEthAdapter] = useState<EthersAdapter>();

  const [getUserNonce, nonceData] = useLazyGetNonceQuery();
  const [login, loginData] = useLoginMutation();
  const [updateUser, updateUserData] = useUpdateUserMutation();

  const [isAuthorized, setIsAuthorized] = useState<boolean>(
    () => !!localStorage.getItem("accessToken"),
  );

  const { data } = useGetUserQuery(!isAuthorized ? skipToken : undefined);

  const userData = useMemo(() => {
    if (typeof data === "string") console.log(data);
    else return data;
  }, [data]);

  useEffect(() => {
    if (updateUserData.isUninitialized) return;

    if (!!updateUserData.isError)
      return console.log("--login error", updateUserData);
    if (!updateUserData.isSuccess)
      return console.log("--login error", updateUserData);
  }, [updateUserData]);

  useEffect(() => {
    if (loginData.isUninitialized) return;

    if (!!loginData.isError) return console.log("--login error", loginData);
    if (!loginData.isSuccess) return console.log("--login error", loginData);

    setIsAuthorized(true);
  }, [loginData]);

  useEffect(() => {
    (async () => {
      if (
        isAuthorized ||
        !ethAdapter ||
        !nonceData ||
        !nonceData.isSuccess ||
        !nonceData?.currentData
      )
        return;

      const address = await ethAdapter.getSignerAddress();

      if (!address) return;

      if (_.isString(nonceData.currentData))
        return console.log("--get nonce error", nonceData);

      const signer = ethAdapter.getSigner();

      if (!signer) return console.log("--error getting signer");

      const signature = await signer.signMessage(
        JSON.stringify(nonceData.currentData),
      );

      if (!signature) return console.log("--user rejected signature");

      await login({ signature, address });
    })();
  }, [ethAdapter, isAuthorized, nonceData, login]);

  useEffect(() => {
    (async () => {
      if (!ethAdapter) return;

      const address = await ethAdapter.getSignerAddress();

      if (!address) return;

      console.log("--address", address);

      await getUserNonce(address);
    })();
  }, [ethAdapter, getUserNonce]);

  const handleConnectMetamask = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    let signer = provider.getSigner();

    if ((await signer.getChainId()) !== 11155111) {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: "0xaa36a7" },
      ]);

      await provider.send("eth_requestAccounts", []);

      signer = provider.getSigner();
    }

    setEthAdapter(
      new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      }),
    );
  }, []);

  const handleCreateSafeWallet = useCallback(async () => {
    if (!ethAdapter) return alert("NO ETH ADAPTER");

    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });

    const safeAccountConfig: SafeAccountConfig = {
      owners: [(await ethAdapter.getSignerAddress()) ?? ""],
      threshold: 1,
    };

    let address = await safeFactory.predictSafeAddress(safeAccountConfig);

    console.log("--safe address", address);

    if ((await ethAdapter.getContractCode(address)).length === 0) {
      const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });

      address = await safeSdkOwner1.getAddress();
    }

    await updateUser({ safeWalletAddress: address });
  }, [ethAdapter, updateUser]);

  const isMetamaskConnected = useMemo<boolean>(
    () => !!ethAdapter,
    [ethAdapter],
  );

  return (
    <authContext.Provider
      value={{
        handleConnectMetamask,
        isMetamaskConnected,
        handleCreateSafeWallet,
        isAuthorized: isAuthorized,
        userData,
      }}
    >
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => {
  const data = useContext(authContext);

  return data;
};
