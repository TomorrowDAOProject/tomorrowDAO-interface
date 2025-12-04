'use client';

import dynamic from 'next/dynamic';
import { SkeletonList } from 'components/Skeleton';
export default dynamic(() => import('pageComponents/assets'), {
  ssr: false,
  loading: () => <SkeletonList />,
});
