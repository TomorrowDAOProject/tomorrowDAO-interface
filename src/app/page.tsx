'use client';
import React, { useRef, useState } from 'react';
import HomePage from './_page';
import NavHeader from 'components/NavHeader';

import './home.css';

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
      <NavHeader
        className={showHeader ? 'backdrop-blur-[10px]' : ''}
        style={{ top: !showHeader ? '-80px' : '0' }}
      />

      <HomePage parentRef={scrollContainerRef} onScroll={handleScroll} />
    </div>
  );
}
