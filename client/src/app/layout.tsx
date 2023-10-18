'use client';

import { ApiProvider } from '@reduxjs/toolkit/query/react';
import AuthContextProvider from '../components/contexts/auth/useAuth';

import { zaapApi } from '../services';
import '../styles/index.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body className={'dark'}>
				<ApiProvider api={zaapApi}>
					<AuthContextProvider>{children}</AuthContextProvider>
				</ApiProvider>
			</body>
		</html>
	);
}
