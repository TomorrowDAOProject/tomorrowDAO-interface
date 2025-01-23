'use client';

import React, { ReactNode, useRef, useState } from 'react';
import { ScrollProvider } from 'provider/ScrollProvider';
import NavHeader from 'components/NavHeader';
import clsx from 'clsx';
import NavFooter from 'components/NavFooter';

interface ILayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: ILayoutProps) => {
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
    <ScrollProvider value={{ onScroll: handleScroll, scrollContainerRef }}>
      <div
        className="flex flex-col bg-baseBg h-screen overflow-x-hidden overflow-y-auto"
        ref={(ref) => ref && (scrollContainerRef.current = ref)}
      >
        <NavHeader
          className={clsx(showHeader ? 'top-0' : 'top-[-80px]', {
            'backdrop-blur-[10px]': showHeader,
          })}
        />
        {children}
        <NavFooter />
      </div>
    </ScrollProvider>
  );
};

export default Layout;
