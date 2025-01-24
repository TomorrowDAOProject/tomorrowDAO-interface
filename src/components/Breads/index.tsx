import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import breadCrumbManager from 'utils/breadCrumb';
import clsx from 'clsx';

interface IBreadsProps {
  className?: string;
}

export type TBreadcrumbItem = {
  key?: React.Key;
  /**
   * Different with `path`. Directly set the link of this item.
   */
  href?: string;
  /**
   * Different with `href`. It will concat all prev `path` to the current one.
   */
  path?: string;
  title?: React.ReactNode;
  breadcrumbName?: string;
  /** @deprecated Please use `menu` instead */
  overlay?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
  /** @deprecated Please use `menu` instead */
  children?: Omit<TBreadcrumbItem, 'children'>[];
};

const Breads = ({ className }: IBreadsProps) => {
  const [items, setItems] = useState<TBreadcrumbItem[]>([]);
  useEffect(() => {
    breadCrumbManager.setUpdateFunction(setItems);
  }, [setItems]);
  const renderItems: TBreadcrumbItem[] = useMemo(() => {
    return items?.map((item, index) => {
      const isLast = index === items.length - 1;
      return {
        title: isLast ? (
          item.title
        ) : item.href ? (
          <Link
            href={item.href}
            className="text-lightGrey text-desc15 font-Montserrat hover:text-white"
            prefetch={true}
          >
            {item.title}
          </Link>
        ) : (
          item.title
        ),
      };
    });
  }, [items]);
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {renderItems?.map((item, index) => (
        <span className="flex items-center gap-2">
          <span
            className={clsx('text-lightGrey text-[15px] font-Montserrat', {
              '!text-desc14 !text-white': index === renderItems.length - 1,
            })}
          >
            {item.title}
          </span>
          {index < renderItems.length - 1 && (
            <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey font-Montserrat" />
          )}
        </span>
      ))}
    </div>
  );
};

export default Breads;
