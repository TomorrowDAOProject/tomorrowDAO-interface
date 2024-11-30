'use client';
import React, { useEffect, useRef, useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import HomePage from './_page';
import './home.css';
import Link from 'next/link';
import NavHeader from 'components/NavHeader';

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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    let lastScrollPosition = 0;
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (scrollContainer) {
        const position = scrollContainer.scrollTop;

        if (lastScrollPosition > position) {
          setShowHeader(true);
        } else {
          setShowHeader(false);
        }

        lastScrollPosition = position;
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col bg-baseBg h-screen overflow-x-hidden overflow-y-auto"
      ref={scrollContainerRef}
    >
      <NavHeader style={{ top: !showHeader ? '-80px' : '0' }} />
      <div className="tmrwdao-grid">
        {/* <div className="col-3 bg-red-500 offset-6 p-2">Item 1 (3 cols)</div> */}
        {/* <div className="col-4 bg-red-500 p-2">Item 2 (4 cols)</div> */}
        {/* <div className="col-5 bg-red-500 p-2">Item 3 (5 cols)</div> */}
      </div>
      <HomePage />
    </div>
  );
}
