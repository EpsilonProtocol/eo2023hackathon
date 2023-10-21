import { attachParams } from '@/utils/url.utils';
import { zaapApi } from '..';
import { GET_NONCE_URL, GET_USER_URL, LOGIN_URL, UPDATE_USER_URL } from '../../config/url';
import { ApiResponse } from '../types';
import { LoginRequestParams, UpdateUserParams } from './request';
import { GetNonceResponse, GetUserResponse, LoginResponse } from './response';

const userService = zaapApi.injectEndpoints({
	endpoints: (build) => ({
		getUser: build.query<GetUserResponse | string, void>({
			providesTags: ['USER_DATA'],
			query: () => GET_USER_URL,
			transformResponse: (data: ApiResponse<GetUserResponse>) => {
				if (!data.status) return data.data.message;

				return data.data;
			},
		}),

		getNonce: build.query<GetNonceResponse | string, string>({
			query: (address) => attachParams(GET_NONCE_URL, { address }),
			transformResponse: (data: ApiResponse<GetNonceResponse>) => {
				if (!data.status) return data.data.message;

				return data.data;
			},
		}),

		updateUser: build.mutation<string | void, UpdateUserParams>({
			invalidatesTags: ['USER_DATA'],
			query: (body) => ({ method: 'POST', url: UPDATE_USER_URL, body }),
			transformResponse: (data: ApiResponse<UpdateUserParams>) => {
				if (!data.status) return data.data.message;
			},
		}),

		login: build.mutation<string | void, LoginRequestParams>({
			invalidatesTags: ['USER_DATA'],
			query: (body) => ({ method: 'POST', url: LOGIN_URL, body }),
			transformResponse: (data: ApiResponse<LoginResponse>) => {
				if (!data.status) return data.data.message;

				localStorage.setItem('accessToken', data.data.accessToken);
			},
		}),
	}),
});

export const { useGetNonceQuery, useGetUserQuery, useLazyGetNonceQuery, useLoginMutation, useUpdateUserMutation } = userService;
