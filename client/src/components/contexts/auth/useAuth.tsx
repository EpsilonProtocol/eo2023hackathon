"use client";

import { NEXT_PUBLIC_ZAAPBOT_MODULE } from "@/config/env";
import { skipToken } from "@reduxjs/toolkit/query";
import Safe, {
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
  isLoading: boolean;
  isZaapbotModuleEnabled: boolean;
  isZaapbotModuleEnabledLoading: boolean;
  handleCreateSafeWallet: () => Promise<void>;
  handleConnectMetamask: () => Promise<void>;
  handleEnableZaapbotModule: () => Promise<void>;
  isMetamaskConnected: boolean;
  isAuthorized: boolean;
  userData?: User;
};

const authContext = createContext<AuthContext>({
  isLoading: true,
  isZaapbotModuleEnabled: false,
  isZaapbotModuleEnabledLoading: true,
  isAuthorized: false,
  handleCreateSafeWallet: async () => {},
  handleConnectMetamask: async () => {},
  handleEnableZaapbotModule: async () => {},
  isMetamaskConnected: false,
});

type AuthContextProviderProps = {
  children: JSX.Element | JSX.Element[] | string | ReactNode;
};

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [isWalletActionLoading, setIsWalletActionLoading] =
    useState<boolean>(false);
  const [ethAdapter, setEthAdapter] = useState<EthersAdapter>();

  const [isZaapbotModuleEnabledLoading, setIsZaapbotModuleEnabledLoading] =
    useState<boolean>(true);
  const [isZaapbotModuleEnabled, setIsZaapbotModuleEnabled] =
    useState<boolean>(false);

  const [getUserNonce, nonceData] = useLazyGetNonceQuery();
  const [login, loginData] = useLoginMutation();
  const [updateUser, updateUserData] = useUpdateUserMutation();

  const [isAuthorized, setIsAuthorized] = useState<boolean>(
    () => !!localStorage.getItem("accessToken"),
  );

  const { data, isFetching: isGetUserFetching } = useGetUserQuery(
    !isAuthorized ? skipToken : undefined,
  );

  const userData = useMemo(() => {
    if (typeof data === "string") console.log(data);
    else return data;
  }, [data]);

  const isLoading = useMemo(() => {
    return (
      nonceData.isFetching ||
      loginData.isLoading ||
      updateUserData.isLoading ||
      isGetUserFetching ||
      isWalletActionLoading
    );
  }, [
    nonceData,
    loginData,
    updateUserData,
    isGetUserFetching,
    isWalletActionLoading,
  ]);

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
      if (!ethAdapter || !userData?.safeWalletAddress) return;

      const safeContract = await Safe.create({
        ethAdapter: ethAdapter,
        safeAddress: userData.safeWalletAddress,
      });

      const isModuleEnabled = await safeContract.isModuleEnabled(
        NEXT_PUBLIC_ZAAPBOT_MODULE,
      );

      console.log({ isModuleEnabled });

      setIsZaapbotModuleEnabled(isModuleEnabled);
      setIsZaapbotModuleEnabledLoading(false);
    })();
  }, [userData, ethAdapter]);

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

      setIsWalletActionLoading(true);

      const signature = await signer.signMessage(
        JSON.stringify(nonceData.currentData),
      );

      setIsWalletActionLoading(false);

      if (!signature) return console.log("--user rejected signature");

      await login({ signature, address });
    })();
  }, [ethAdapter, isAuthorized, nonceData, login]);

  useEffect(() => {
    (async () => {
      if (!ethAdapter) return;

      const address = await ethAdapter.getSignerAddress();

      if (!address) return;

      await getUserNonce(address);
    })();
  }, [ethAdapter, getUserNonce]);

  const handleConnectMetamask = useCallback(async () => {
    setIsWalletActionLoading(true);

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    let signer = provider.getSigner();

    if ((await signer.getChainId()) !== 5) {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x5" }]);

      await provider.send("eth_requestAccounts", []);

      signer = provider.getSigner();
    }

    setIsWalletActionLoading(false);

    setEthAdapter(
      new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      }),
    );
  }, []);

  const handleCreateSafeWallet = useCallback(async () => {
    setIsWalletActionLoading(true);

    if (!ethAdapter) return alert("NO ETH ADAPTER");

    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });

    const safeAccountConfig: SafeAccountConfig = {
      owners: [(await ethAdapter.getSignerAddress()) ?? ""],
      threshold: 1,
    };

    let address = await safeFactory.predictSafeAddress(safeAccountConfig);

    if ((await ethAdapter.getContractCode(address)).length === 0) {
      const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });

      address = await safeSdkOwner1.getAddress();
    }

    setIsWalletActionLoading(false);

    await updateUser({ safeWalletAddress: address });
  }, [ethAdapter, updateUser]);

  const handleEnableZaapbotModule = useCallback(async () => {
    if (!ethAdapter || !userData?.safeWalletAddress) return;

    setIsWalletActionLoading(true);

    const safeContract = await Safe.create({
      ethAdapter: ethAdapter,
      safeAddress: userData.safeWalletAddress,
    });

    const enableModuleTransaction = await safeContract.createEnableModuleTx(
      NEXT_PUBLIC_ZAAPBOT_MODULE,
    );

    const txResponse = await safeContract.executeTransaction(
      enableModuleTransaction,
    );

    await txResponse.transactionResponse?.wait();

    setIsWalletActionLoading(false);
    setIsZaapbotModuleEnabled(true);
  }, [ethAdapter, userData?.safeWalletAddress]);

  const isMetamaskConnected = useMemo<boolean>(
    () => !!ethAdapter,
    [ethAdapter],
  );

  return (
    <authContext.Provider
      value={{
        handleEnableZaapbotModule,
        isZaapbotModuleEnabledLoading,
        isLoading,
        isZaapbotModuleEnabled,
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
