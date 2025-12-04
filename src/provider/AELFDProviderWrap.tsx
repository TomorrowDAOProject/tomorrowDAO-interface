'use client';
import { AELFDProvider } from 'aelf-design';
// import { ConfigProvider as MobileConfigProvider, ErrorBlock } from 'antd-mobile';
import { PREFIXCLS, THEME_CONFIG, CUSTOM_TOKEN } from 'utils/AntdThemeConfig';
import en_US from 'antd/lib/locale/en_US';
// import enUS from 'antd-mobile/es/locales/en-US';
import { ConfigProvider } from 'antd';
interface IProps {
  children: React.ReactNode;
}
export default function AELFDProviderWrap(props: IProps) {
  const { children } = props;
  return (
    <AELFDProvider prefixCls={PREFIXCLS} theme={THEME_CONFIG} customToken={CUSTOM_TOKEN}>
      <ConfigProvider locale={en_US} prefixCls={PREFIXCLS} theme={THEME_CONFIG}>
        {/* <MobileConfigProvider locale={enUS}> */}
        {children}
        {/* </MobileConfigProvider> */}
      </ConfigProvider>
    </AELFDProvider>
  );
}
