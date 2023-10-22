"use client";

import { useGetTwitterUrlQuery } from "@/services/twitter-service";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../components/contexts/auth/useAuth";

import metamaskHero from "@/assets/images/metamask.svg";
import safeHero from "@/assets/images/safe.png";
import successHero from "@/assets/images/success.svg";
import twitterHero from "@/assets/images/twitter.svg";

import Loader from "@/components/ui/loaders/Loader";
import Image from "next/image";
import classes from "./AuthPage.module.scss";

export default function AuthPage() {
  const {
    isAuthorized,
    isZaapbotModuleEnabled,
    isMetamaskConnected,
    handleConnectMetamask,
    handleCreateSafeWallet,
    handleEnableZaapbotModule,
    isZaapbotModuleEnabledLoading,
    userData,
    isLoading,
  } = useAuth();

  const { data } = useGetTwitterUrlQuery();

  const [isSafeCreatedShown, setIsSafeCreatedShown] = useState<boolean>(false);

  const shouldDisplayConnectMetamask = useMemo(() => {
    return !isMetamaskConnected;
  }, [isMetamaskConnected]);

  const shouldDisplayCreateSafeWallet = useMemo(() => {
    return !!isAuthorized && !userData?.safeWalletAddress;
  }, [isAuthorized, userData]);

  const shouldDisplayConnectTwitter = useMemo(() => {
    return data && typeof data !== "string";
  }, [data]);

  useEffect(() => {
    if (!shouldDisplayConnectMetamask && !shouldDisplayCreateSafeWallet) {
      setTimeout(() => {
        setIsSafeCreatedShown(true);
      }, 1);
    }
  }, [shouldDisplayConnectMetamask, shouldDisplayCreateSafeWallet]);

  return (
    <div className={classes.container}>
      {isLoading ? (
        <Loader />
      ) : shouldDisplayConnectMetamask ? (
        <div className={classes.connect_metamask_container}>
          <h1 className={classes.header}>Connect Wallet</h1>

          <Image width={150} height={150} src={metamaskHero} alt="metamask" />

          <button className={classes.cta} onClick={handleConnectMetamask}>
            Connect Metamask
            <Image width={32} height={32} src={metamaskHero} alt="metamask" />
          </button>
        </div>
      ) : shouldDisplayCreateSafeWallet ? (
        <div className={classes.create_safe_container}>
          <h1 className={classes.header}>Create Safe Wallet</h1>

          <Image width={150} height={150} src={safeHero} alt="Safe" />

          <button className={classes.cta} onClick={handleCreateSafeWallet}>
            Create Safe Wallet
            <Image width={32} height={32} src={safeHero} alt="Create Safe" />
          </button>
        </div>
      ) : !isSafeCreatedShown ? (
        <div className={classes.created_safe_success}>
          <Image width={250} height={250} src={successHero} alt="Safe" />

          <h1 className={classes.header}>Safe Wallet Created!</h1>
        </div>
      ) : isZaapbotModuleEnabledLoading ? (
        <Loader />
      ) : !isZaapbotModuleEnabled ? (
        <div className={classes.enable_module_container}>
          <div>
            <h1 className={classes.header}>Enable ZaapBot Module</h1>
            <h4 className={classes.sub_header}>
              ZaapBot Module is a contract that allows us make bets using the
              funds in your safe wallet
            </h4>
          </div>

          <button className={classes.cta} onClick={handleEnableZaapbotModule}>
            Enable Zaapbot Module
            <Image width={32} height={32} src={safeHero} alt="Create Safe" />
          </button>
        </div>
      ) : shouldDisplayConnectTwitter ? (
        <div className={classes.connect_twitter_container}>
          <h1 className={classes.header}>Link Twitter Account</h1>

          <Image width={150} height={150} src={twitterHero} alt="twitter" />

          <a
            className={classes.cta}
            href={typeof data === "string" ? data : data?.url}
          >
            Connect Twitter
            <Image width={32} height={32} src={twitterHero} alt="twitter" />
          </a>
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
}
