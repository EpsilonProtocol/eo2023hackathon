"use client";

import { useAuth } from "@/components/contexts/auth/useAuth";
import Loader from "@/components/ui/loaders/Loader";
import { useConnectTwitterMutation } from "@/services/twitter-service";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import successImage from "@/assets/images/success.svg";

import _ from "lodash";
import Image from "next/image";
import Link from "next/link";
import classes from "./TwitterRedirectPage.module.scss";

export default function TwitterRedirect() {
  const param = useSearchParams();

  const [connectTwitter, connectTwitterData] = useConnectTwitterMutation();
  const { userData } = useAuth();

  useEffect(() => {
    if (localStorage.getItem("twitterOauthState") !== param.get("state"))
      return;

    connectTwitter({
      code: param.get("code") ?? "",
      redirectUrl: "http://localhost:3000/twitter/redirect",
      verifier: localStorage.getItem("twitterVerifier") ?? "",
    });
  }, [param, connectTwitter]);

  if (
    connectTwitterData.isUninitialized ||
    connectTwitterData.isLoading ||
    !userData?.twitter?.username
  )
    return (
      <div className={classes.container}>
        <Loader />
      </div>
    );

  return (
    <div className={classes.container}>
      <div className={classes.success_container}>
        <h1 className={classes.header}>Twitter Account Linked</h1>
        <Image width={250} height={250} src={successImage} alt="success" />
        <h3 className={classes.subheader}>
          You can now place bets directly from twitter using @zaapbot
        </h3>
        <h4 className={classes.body}>
          Please read the instructions on how to structure the message for
          placing a bet here
        </h4>
        <div className={classes.account_details}>
          <div className={classes.account_details_row}>
            <div className={classes.account_details_key}>Twitter Username</div>
            <div className={classes.account_details_value}>
              {userData.twitter.username}
            </div>
          </div>
          <div className={classes.account_details_row}>
            <div className={classes.account_details_key}>
              Safe Wallet Address
            </div>
            <div className={classes.account_details_value}>
              {_.truncate(userData.safeWalletAddress, { length: 20 })}
            </div>
          </div>
          <div className={classes.account_details_row}>
            <div className={classes.account_details_key}>
              Controlling Wallet Address
            </div>
            <div className={classes.account_details_value}>
              {_.truncate(userData.walletAddress, { length: 20 })}
            </div>
          </div>
        </div>

        <Link href="/" className={classes.continue_button}>
          Go to dashboard -&gt;
        </Link>
      </div>
    </div>
  );
}
