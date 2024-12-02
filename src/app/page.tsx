'use client';
import React, { useRef, useState } from 'react';
import HomePage from './_page';

import './home.css';
import { useMyContext } from 'provider/homeProvider';

export default function Page() {
  const context: any = useMyContext();
  const { scrollContainerRef, onScroll } = context;

  return <HomePage parentRef={scrollContainerRef} onScroll={onScroll} />;
}
