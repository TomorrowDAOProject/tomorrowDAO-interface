'use client';
import React from 'react';
import { ConfigContext, IConfigContent } from './type';

interface Props {
  children: React.ReactNode;
  config: IConfigContent;
}
export default function ConfigProvider(props: Readonly<Props>) {
  const { children, config } = props;
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}
