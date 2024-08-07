'use client';
import React from 'react';
import dynamicReq from 'next/dynamic';
import { SkeletonList } from 'components/Skeleton';
const PageIndex = dynamicReq(() => import('./_page'), {
  ssr: false,
  loading: () => <SkeletonList />,
});
export default function Page(props: { params: { aliasName: string } }) {
  return <PageIndex aliasName={props.params.aliasName} />;
}
