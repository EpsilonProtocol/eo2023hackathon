import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../config/url";

export const zaapApi = createApi({
  tagTypes: ["USER_DATA"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) headers.set("Authorization", accessToken);

      return headers;
    },
  }),
  endpoints: () => ({}),
});
