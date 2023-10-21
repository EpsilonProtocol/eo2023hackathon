import { TwitterApi } from "twitter-api-v2";
import { TWITTER_OAUTH2_CLIENTID, TWITTER_OAUTH2_SECRET } from "../config/env";

class TwitterService {
  client: TwitterApi;

  constructor() {
    this.client = new TwitterApi({
      clientId: TWITTER_OAUTH2_CLIENTID,
      clientSecret: TWITTER_OAUTH2_SECRET,
    });
  }

  getUrl(redirectUrl: string) {
    return this.client.generateOAuth2AuthLink(redirectUrl, {
      scope: ["tweet.read", "block.read", "users.read"],
    });
  }

  login(code: string, verifier: string, redirectUri: string) {
    return this.client.loginWithOAuth2({
      code,
      codeVerifier: verifier,
      redirectUri: redirectUri,
    });
  }
}

export const twitterService = new TwitterService();
