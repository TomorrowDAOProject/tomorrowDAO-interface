'use client';
import React from 'react';
import { SkeletonList } from 'components/Skeleton';

import dynamicReq from 'next/dynamic';
const PageIndex = dynamicReq(() => import('./proposal-list/_page'), {
    ssr: false,
    loading: () => <SkeletonList />
});

export default function Page() {
    return <PageIndex />;
}
