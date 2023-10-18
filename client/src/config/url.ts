import { NEXT_PUBLIC_API_BASE_URL } from './env';

export const API_BASE_URL = NEXT_PUBLIC_API_BASE_URL;

// USER URLS

const USER_BASE_URL = '/user';

export const GET_NONCE_URL = `${USER_BASE_URL}/nonce`;
export const LOGIN_URL = `${USER_BASE_URL}/login`;
