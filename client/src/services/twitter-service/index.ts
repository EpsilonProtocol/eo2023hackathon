import { CONNECT_TWITTER_URL, GET_TWITTER_OAUTH2_URL } from "@/config/url";
import { zaapApi } from "..";
import { ApiResponse } from "../types";
import { ConnectTwitterRequest } from "./request";
import { GetTwitterUrlResponse } from "./response";

const twitterService = zaapApi.injectEndpoints({
  endpoints: (build) => ({
    getTwitterUrl: build.query<GetTwitterUrlResponse | string, void>({
      query: () => GET_TWITTER_OAUTH2_URL,
      transformResponse: (data: ApiResponse<GetTwitterUrlResponse>) => {
        if (!data.status) return data.data.message;

        localStorage.setItem("twitterRedirectUrl", data.data.url);
        localStorage.setItem("twitterVerifier", data.data.verifier);
        localStorage.setItem("twitterOauthState", data.data.state);

        return data.data;
      },
    }),

    connectTwitter: build.mutation<void | string, ConnectTwitterRequest>({
      invalidatesTags: ["USER_DATA"],
      query: (data) => ({
        method: "POST",
        url: CONNECT_TWITTER_URL,
        body: data,
      }),
      transformResponse: (data: ApiResponse<void>) => {
        if (!data.status) return data.data.message;
      },
    }),
  }),
});

export const { useGetTwitterUrlQuery, useConnectTwitterMutation } =
  twitterService;
