'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import EditDao from 'pageComponents/edit-dao';
import { networkDaoId } from 'config';

export default function DeoDetails() {
  return (
    <div>
      <EditDao daoId={networkDaoId} isNetworkDAO={true} />
    </div>
  );
}
