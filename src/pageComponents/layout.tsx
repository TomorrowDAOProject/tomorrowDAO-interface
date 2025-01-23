'use client';
import React, { Suspense, useRef, useState } from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import DynamicBreadCrumb from 'components/DynamicBreadCrumb';
import PageLoading from 'components/Loading';
import { usePathname } from 'next/navigation';
import ResultModal from 'components/ResultModal';
import './layout.css';
import DAOHeader from './home/components/DAOHeader';
import NavHeader from 'components/NavHeader';
import NavFooter from 'components/NavFooter';
import clsx from 'clsx';
import { ScrollProvider } from 'provider/ScrollProvider';

const Layout = (props: React.PropsWithChildren<{}>) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showHeader, setShowHeader] = useState(true);
  const lastPosition = useRef(0);

  const handleScroll = () => {
    console.log('lastPosition.current', lastPosition.current);
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
  const { children } = props;
  const pathName = usePathname();
  const isExplore = pathName === '/explore';

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
        {isExplore && <DAOHeader />}
        {children}
        <NavFooter />
        <PageLoading />
        <ResultModal />
      </div>
    </ScrollProvider>
  );
};

export default Layout;
