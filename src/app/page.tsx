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
  const lastPosition = useRef(0);

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const position = scrollContainer.scrollTop;

      if (lastPosition.current > position) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }

      lastPosition.current = position;
    }
  };

  return (
    <div
      className="flex flex-col bg-baseBg h-screen overflow-x-hidden overflow-y-auto"
      ref={scrollContainerRef}
    >
      <NavHeader style={{ top: !showHeader ? '-80px' : '0' }} />

      <HomePage parentRef={scrollContainerRef} onScroll={handleScroll} />
    </div>
  );
}
