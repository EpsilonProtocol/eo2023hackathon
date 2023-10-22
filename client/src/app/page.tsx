"use client";

import { useAuth } from "@/components/contexts/auth/useAuth";
import { useEffect, useState } from "react";

import Loader from "@/components/ui/loaders/Loader";
import { ethers } from "ethers";
import _ from "lodash";
import { useRouter } from "next/navigation";
import classes from "./HomePage.module.scss";

export default function Web() {
  const [loading, setLoading] = useState(true);

  const {
    userBalance,
    userAllowance,
    isAuthorized,
    isLoading,
    userData,
    isMetamaskConnected,
    handleConnectMetamask,
    handleSetAllowance,
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isAuthorized) return router.replace("/auth");

    if (!isMetamaskConnected) handleConnectMetamask();

    setLoading(false);
  }, [isAuthorized, router, handleConnectMetamask, isMetamaskConnected]);

  if (loading || isLoading)
    return (
      <div className={classes.loading_container}>
        <Loader />
      </div>
    );

  return (
    <div className={classes.main_container}>
      <h1 className={classes.header}>Account Details</h1>

      <div className={classes.account_details}>
        <div className={classes.account_details_row}>
          <div className={classes.account_details_key}>Twitter Username</div>
          <div className={classes.account_details_value}>
            {userData?.twitter.username}
          </div>
        </div>
        <div className={classes.account_details_row}>
          <div className={classes.account_details_key}>Safe Wallet Address</div>
          <div className={classes.account_details_value}>
            {_.truncate(userData?.safeWalletAddress, { length: 100 })}
          </div>
        </div>
        <div className={classes.account_details_row}>
          <div className={classes.account_details_key}>
            Controlling Wallet Address
          </div>
          <div className={classes.account_details_value}>
            {_.truncate(userData?.walletAddress, { length: 100 })}
          </div>
        </div>
      </div>

      <div className={classes.balance_container}>
        <p className={classes.header}>
          Balance <br />
          <h2>
            {parseFloat(ethers.utils.formatEther(userBalance)).toPrecision(2)}
            ETH
          </h2>
        </p>

        <p className={classes.header}>
          Allowance <br />
          <h2>
            {parseFloat(ethers.utils.formatEther(userAllowance)).toPrecision(2)}
            ETH
          </h2>
        </p>

        <div className={classes.balance_actions}>
          <button
            className={classes.allowance_button}
            onClick={handleSetAllowance}
          >
            Set Allowance
          </button>
        </div>
      </div>

      <div className={classes.activity_table}></div>
    </div>
  );
}
