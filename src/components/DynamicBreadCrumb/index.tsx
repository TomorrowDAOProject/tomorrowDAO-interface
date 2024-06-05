'use client';
import Breadcrumb from 'components/Breadcrumb';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { LeftOutlined } from '@aelf-design/icons';
import { INavItemProps } from 'components/Breadcrumb';
import useResponsive from 'hooks/useResponsive';

const denyList = ['/', '/explore'];
const DynamicBreadCrumb = () => {
  const pathname = usePathname();

  const { isLG } = useResponsive();
  const router = useRouter();

  const items: INavItemProps[] = useMemo(() => {
    if (pathname === '/') {
      return [];
    }
    const pathArr = pathname.split('/');
    const arr: INavItemProps[] = [];
    pathArr.forEach((path, index) => {
      if (index === 0) {
        arr.push({
          title: 'TMRW DAO',
        });
      } else {
        arr.push({
          title: path,
        });
      }
    });
    return arr;
  }, [pathname]);

  return (
    <div className="pb-6 ">
      {isLG && !denyList.includes(pathname) ? (
        <span
          className="breadcrumb-back-button flex items-center"
          onClick={() => {
            router.back();
          }}
        >
          <LeftOutlined className="icon" />
          <span>Back</span>
        </span>
      ) : (
        <Breadcrumb items={items} />
      )}
    </div>
  );
};

export default DynamicBreadCrumb;
