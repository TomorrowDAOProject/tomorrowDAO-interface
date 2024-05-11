'use client';
import React, { useEffect, Suspense } from 'react';
import { Layout as AntdLayout } from 'antd';
import StoreProvider from './store';
import NetworkDaoHeader from 'components/NetworkDaoHeader';

import Loading from 'components/Loading';
import dynamicReq from 'next/dynamic';
import {
  useWebLoginEvent,
  useWebLogin,
  WebLoginState,
  useLoginState,
  WebLoginEvents,
  ERR_CODE,
} from 'aelf-web-login';
import { store } from 'redux/store';
import Footer from 'components/Footer';
import DynamicBreadCrumb from 'components/DynamicBreadCrumb';
import { useWalletInit } from 'hooks/useWallet';
import PageLoading from 'components/Loading';
import { usePathname } from 'next/navigation';
import { NetworkDaoHomePathName } from 'config';

const Layout = dynamicReq(
  async () => {
    return (props: React.PropsWithChildren<{}>) => {
      const { children } = props;

      useWalletInit();
      const pathName = usePathname();
      const isHomePage = pathName === NetworkDaoHomePathName;

      return (
        <StoreProvider>
          <div className="flex w-[100vw] h-[100vh] flex-col relative box-border min-h-screen bg-global-grey">
            <Suspense>
              <NetworkDaoHeader />
            </Suspense>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <Suspense>
                <div className="flex-1 flex justify-center">
                  <div
                    className={`flex-1 max-w-[1440px] mx-auto ${
                      isHomePage ? '' : 'py-6 mb-6 px-4 lg:px-10'
                    }`}
                  >
                    {children}
                  </div>
                </div>
              </Suspense>
              <Suspense>
                <Footer />
              </Suspense>
            </div>
            <PageLoading />
          </div>
        </StoreProvider>
      );
    };
  },
  { ssr: false },
);

export default Layout;