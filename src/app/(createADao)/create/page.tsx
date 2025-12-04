import React from 'react';
import PageIndex from './CreateDaoPage';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Create with TMRWDAO: Launch Your DAO Decentralised Project',
  description:
    'Start your decentralised journey with AI on TMRWDAO. Easily create & launch projects using blockchain technology for transparent, community-driven success.',
};
export default function Page() {
  return <PageIndex />;
}
