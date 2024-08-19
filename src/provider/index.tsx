'use client';
import { useUrlPath } from 'hooks/useUrlPath';
import StoreProvider from './store';
import WebLoginProvider from './webLoginProvider';

interface IProps {
  children: React.ReactNode;
}
function Provider(props: IProps) {
  const { children } = props;
  const { isTelegram } = useUrlPath();
  return (
    <div className={`${isTelegram ? 'telegram-webapp-wrap' : 'brower-app'}`}>
      <StoreProvider>
        <WebLoginProvider>{children}</WebLoginProvider>
      </StoreProvider>
    </div>
  );
}

export default Provider;
