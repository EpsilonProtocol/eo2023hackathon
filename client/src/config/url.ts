import { NEXT_PUBLIC_API_BASE_URL } from "./env";

export const API_BASE_URL = NEXT_PUBLIC_API_BASE_URL;

// USER URLS

const USER_BASE_URL = "/user";

export const GET_USER_URL = `${USER_BASE_URL}/`;
export const UPDATE_USER_URL = `${USER_BASE_URL}/`;
export const GET_NONCE_URL = `${USER_BASE_URL}/nonce`;
export const LOGIN_URL = `${USER_BASE_URL}/login`;

// TWITTER URLS

const TWITTER_BASE_URL = "/twitter";

export const GET_TWITTER_OAUTH2_URL = `${TWITTER_BASE_URL}/url`;
export const CONNECT_TWITTER_URL = `${TWITTER_BASE_URL}/connect`;
