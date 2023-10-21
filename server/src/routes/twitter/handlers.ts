import dayjs from "dayjs";
import { Request, RequestHandler, Response } from "express";
import { UserService } from "../../services";
import { twitterService } from "../../services/twitter.service";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/response.utils";

type VerifiedRequestHandler = (
  req: Request & { userId: string },
  res: Response,
) => void;

export const handleGetTwitterUrl: RequestHandler = async (req, res) => {
  try {
    const redirectUrl = `${req.headers.origin}/twitter/redirect`;

    const token = twitterService.getUrl(redirectUrl);

    return sendSuccessResponse(res, {
      url: token.url,
      state: token.state,
      verifier: token.codeVerifier,
      challenger: token.codeChallenge,
    });
  } catch (err) {
    return sendErrorResponse(res, err as Error);
  }
};

export const handleConnectTwitter: VerifiedRequestHandler = async (
  req,
  res,
) => {
  try {
    const { code, verifier, redirectUrl } = req.body;

    console.log({ verifier });

    const { client, accessToken, refreshToken, expiresIn } =
      await twitterService.login(code, verifier, redirectUrl);

    const user = await client.v2.me();

    await UserService.updateUserTwitter(req.userId, {
      id: user.data.id,
      name: user.data.name,
      username: user.data.username,
      accessToken,
      refreshToken,
      expiryDate: dayjs(Date.now()).add(expiresIn, "seconds").toDate(),
    });

    return sendSuccessResponse(res, user);
  } catch (err) {
    return sendErrorResponse(res, err as Error);
  }
};
