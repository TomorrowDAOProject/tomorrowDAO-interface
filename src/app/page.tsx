'use client';
import React from 'react';
import dynamicReq from 'next/dynamic';
const PageIndex = dynamicReq(() => import('pageComponents/home'), { ssr: false });
export default function Page() {
  console.log('page.tsx');
  return <PageIndex />;
}

export const ssg = false;
