import { TwitterApi } from "twitter-api-v2";
import {
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  TWITTER_OAUTH2_CLIENTID,
  TWITTER_OAUTH2_SECRET,
} from "../config/env";

export class TwitterService {
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

  async getStream() {
    const app = new TwitterApi({
      appKey: TWITTER_CLIENT_ID,
      appSecret: TWITTER_CLIENT_SECRET,
    });

    const appClient = await app.appLogin();

    return appClient.v1.mentionTimeline();
  }
}

export const twitterService = new TwitterService();
