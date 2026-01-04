'use client';
import dynamic from 'next/dynamic';
import { useUrlPath } from 'hooks/useUrlPath';
import StoreProvider from './store';

// Dynamically import WebLoginProvider to avoid SSR issues with @portkey/* and @aelf-web-login/* libraries
const WebLoginProvider = dynamic(() => import('./webLoginProvider'), {
  ssr: false,
});

interface IProps {
  children: React.ReactNode;
}
function Provider(props: IProps) {
  const { children } = props;
  const { isTelegram } = useUrlPath();
  return (
    <div className={`${isTelegram ? 'telegram-webapp-wrap' : 'brower-app'}`}>
      <WebLoginProvider>
        <StoreProvider>{children}</StoreProvider>
      </WebLoginProvider>
    </div>
  );
}

export default Provider;
