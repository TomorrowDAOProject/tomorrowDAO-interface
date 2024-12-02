'use client';

import React, { useRef, useState } from 'react';
import { MyProvider } from 'provider/homeProvider';
import NavHeader from 'components/NavHeader';

const Layout = ({ children }: { children: React.ReactNode }) => {
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
    <MyProvider value={{ onScroll: handleScroll, scrollContainerRef }}>
      <div
        className="flex flex-col bg-baseBg h-screen overflow-x-hidden overflow-y-auto"
        ref={(ref) => ref && (scrollContainerRef.current = ref)}
      >
        <NavHeader
          className={showHeader ? 'backdrop-blur-[10px]' : ''}
          style={{ top: !showHeader ? '-80px' : '0' }}
        />
        {children}
      </div>
    </MyProvider>
  );
};

export default Layout;
