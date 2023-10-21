"use client";

import { useAuth } from "@/components/contexts/auth/useAuth";
import { useConnectTwitterMutation } from "@/services/twitter-service";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

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
    return <div>Loading...</div>;

  return <div>Connected to twitter Account {userData.twitter.username}</div>;
}
