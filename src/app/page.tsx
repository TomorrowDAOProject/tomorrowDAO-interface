'use client';
import React, { useEffect, useRef } from 'react';
import { Button } from 'aelf-design';
import { RightOutlined } from '@ant-design/icons';
import './home.css';
import Link from 'next/link';
import breadCrumb from 'utils/breadCrumb';
import { eventBus, ShowHeaderExplore } from 'utils/myEvent';
import useResponsive from 'hooks/useResponsive';

interface LinkWithRightArrowProps {
  href: string;
  children: React.ReactNode;
}
const LinkWithRightArrow = (props: LinkWithRightArrowProps) => {
  return (
    <Link target="_blank" href={props.href}>
      <div className="text-colorPrimary flex items-center mt-[16px] text-[16px] font-medium leading-[22px]">
        <span className="pr-[8px] text-[14px]">{props.children}</span> <RightOutlined />
      </div>
    </Link>
  );
};
export default function Page() {
  // const exploreButtonRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   breadCrumb.clearBreadCrumb();
  // }, []);
  // const { isLG } = useResponsive();
  // useEffect(() => {
  //   const top = isLG ? 64 : 82;
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting) {
  //         eventBus.emit(ShowHeaderExplore, false);
  //       } else {
  //         eventBus.emit(ShowHeaderExplore, true);
  //       }
  //     },
  //     { threshold: 0.5, rootMargin: `0px 0px ${top}px 0px` },
  //   );
  //   observer.observe(exploreButtonRef.current as Element);
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, []);
  return (
    <div className="flex">
      <div className="tmrwdao-grid">
        <div className="col-3 bg-red-500 offset-6 p-2">Item 1 (3 cols)</div>
        {/* <div className="col-4 bg-red-500 p-2">Item 2 (4 cols)</div> */}
        <div className="col-5 bg-red-500 p-2">Item 3 (5 cols)</div>
      </div>
    </div>
  );
}
