'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import EditDao from 'pageComponents/edit-dao';

export default function DeoDetails() {
  const { aliasName } = useParams();
  return (
    <div>
      <EditDao aliasName={aliasName as string} isNetworkDAO={false} />
    </div>
  );
}
