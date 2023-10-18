import { zaapApi } from '..';
import { GET_NONCE_URL, LOGIN_URL } from '../../config/url';
import { attachParams } from '../../utils/url.utils';
import { ApiResponse } from '../types';
import { LoginRequestParams } from './request';
import { GetNonceResponse, LoginResponse } from './response';

const userService = zaapApi.injectEndpoints({
	endpoints: (build) => ({
		getNonce: build.query<GetNonceResponse | string, string>({
			query: (address) => attachParams(GET_NONCE_URL, { address }),
			transformResponse: (data: ApiResponse<GetNonceResponse>) => {
				if (!data.status) return data.data.message;

				return data.data;
			},
		}),

		login: build.mutation<string | void, LoginRequestParams>({
			query: (body) => ({ method: 'POST', url: LOGIN_URL, body }),
			transformResponse: (data: ApiResponse<LoginResponse>) => {
				console.log({ data });

				if (!data.status) return data.data.message;

				localStorage.setItem('accessToken', data.data.accessToken);
			},
		}),
	}),
});

export const { useGetNonceQuery, useLazyGetNonceQuery, useLoginMutation } = userService;
