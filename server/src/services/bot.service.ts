import { TwitterService, twitterService } from "./twitter.service";

export class Bot {
  twitterService: TwitterService;

  constructor() {
    this.twitterService = twitterService;
  }

  async init() {
    const mentions = await twitterService.getStream();
  }
}
