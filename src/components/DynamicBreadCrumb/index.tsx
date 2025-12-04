'use client';
import Breadcrumb from 'components/Breadcrumb';
import { usePathname, useRouter } from 'next/navigation';
import { LeftOutlined } from '@aelf-design/icons';
import useResponsive from 'hooks/useResponsive';
import './index.css';

const denyList = ['/', '/explore', '/assets', '/my-daos', '/votigram'];

const DynamicBreadCrumb = () => {
  const pathname = usePathname();

  const { isLG } = useResponsive();
  const router = useRouter();

  if (denyList.includes(pathname)) {
    return null;
  }
  return (
    <div className="lg:pb-6 pb-4">
      {isLG ? (
        <span
          className="breadcrumb-back-button"
          onClick={() => {
            router.back();
          }}
        >
          <LeftOutlined className="icon" />
          <span>Back</span>
        </span>
      ) : (
        <Breadcrumb />
      )}
    </div>
  );
};

export default DynamicBreadCrumb;

// https://t.me/monkeyTmrwDevBot?startapp=https://aa-portkey-test.portkey.finance/api/app/account/eJjb7wJona
// https://t.me/monkeyTmrwDevBot?startapp=referralCode
// referralCode
// https://t.me/monkeyTmrwDevBot?startapp=referralCode
