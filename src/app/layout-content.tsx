'use client';
import { useWalletInit } from 'hooks/useWallet';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import dynamicReq from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { NetworkDaoHomePathName } from 'config';
import { useUrlPath } from 'hooks/useUrlPath';
import Layout from 'pageComponents/layout';
import AELFDProviderWrap from 'provider/AELFDProviderWrap';
import AELFDTelegramProviderWrap from 'provider/AELFDTelegramProviderWrap';
dayjs.extend(advancedFormat);
dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
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
    </>
  );
};
