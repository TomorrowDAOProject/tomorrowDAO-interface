'use client';
import React from 'react';
import dynamicReq from 'next/dynamic';
const PageIndex = dynamicReq(() => import('./_page'), { ssr: false });
export default function Page(props: { params: { daoId: string } }) {
  return <PageIndex daoId={props.params.daoId} />;
}
