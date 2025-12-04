import { Breadcrumb, BreadcrumbProps } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import breadCrumbManager from 'utils/breadCrumb';
export interface INavItemProps {
  title?: string;
  href?: string;
}
export type TBreadcrumbItems = BreadcrumbProps['items'];
const NavForPC = () => {
  const [items, setItems] = useState<TBreadcrumbItems>([]);
  useEffect(() => {
    breadCrumbManager.setUpdateFunction(setItems);
  }, [setItems]);
  const renderItems: TBreadcrumbItems = useMemo(() => {
    return items?.map((item, index) => {
      const isLast = index === items.length - 1;
      return {
        title: isLast ? (
          item.title
        ) : item.href ? (
          <Link href={item.href} prefetch={true}>
            {item.title}
          </Link>
        ) : (
          item.title
        ),
      };
    });
  }, [items]);
  return <Breadcrumb separator="/" items={renderItems} />;
};

export default memo(NavForPC);
