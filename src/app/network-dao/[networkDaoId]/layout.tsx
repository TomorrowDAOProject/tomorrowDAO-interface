'use client';
import React, { Suspense } from 'react';
import NetworkDaoHeader from 'components/NetworkDaoHeader';

import dynamicReq from 'next/dynamic';
import Footer from 'components/Footer';
import { useWalletInit } from 'hooks/useWallet';
import PageLoading from 'components/Loading';

const Layout = dynamicReq(
  async () => {
    return (props: React.PropsWithChildren<{}>) => {
      const { children } = props;

      useWalletInit();

      return (
        <div className="flex w-[100vw] h-[100vh] flex-col relative box-border min-h-screen bg-global-grey">
          <Suspense>
            <NetworkDaoHeader />
          </Suspense>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <Suspense>
              <div>
                <div
                  className={`flex-1 max-w-[1440px] mx-auto bg-white py-6 mb-6 px-4 lg:px-10 w-full`}
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
      );
    };
  },
  { ssr: false },
);

export default Layout;