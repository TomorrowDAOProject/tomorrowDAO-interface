'use client';
import dynamicReq from 'next/dynamic';
import React from 'react';
const PageIndex = dynamicReq(() => import('./_page'), { ssr: false });

export default function Page() {
  return <PageIndex />;
}
export const ssg = false;
