'use client';
import { useWalletInit } from 'hooks/useWallet';
import dynamicReq from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { NetworkDaoHomePathName } from 'config';
import { useUrlPath } from 'hooks/useUrlPath';
import Layout from 'pageComponents/layout';
import AELFDProviderWrap from 'provider/AELFDProviderWrap';
import AELFDTelegramProviderWrap from 'provider/AELFDTelegramProviderWrap';
import { ToastContainer } from 'react-toastify';

import '../assets/fonts/tmrwdao-icon.css';

const WalletInit = dynamicReq(
  async () => {
    return () => {
      useWalletInit();
      return <></>;
    };
  },
  { ssr: false },
);
export const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isNetWorkDao = pathname.startsWith(NetworkDaoHomePathName);
  const { isHome, isTelegram } = useUrlPath();
  // AELFDProviderWrap
  return (
    <>
      {!isHome && <WalletInit />}
      {isTelegram ? (
        <AELFDTelegramProviderWrap>{children}</AELFDTelegramProviderWrap>
      ) : (
        <AELFDProviderWrap>
          {isNetWorkDao || isTelegram ? <div>{children}</div> : <Layout>{children}</Layout>}
        </AELFDProviderWrap>
      )}
      <ToastContainer
        position="top-center"
        hideProgressBar
        closeButton={false}
        pauseOnHover
        theme="dark"
      />
    </>
  );
};
