'use client';
import { AELFDProvider } from 'aelf-design';
import { ConfigProvider as MobileConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import { PREFIXCLS } from 'utils/AntdThemeConfig';
import { ThemeConfig, ConfigProvider } from 'antd';
import { IAelfdCustomToken } from 'aelf-design/dist/esm/provider';
import en_US from 'antd/lib/locale/en_US';

interface IProps {
  children: React.ReactNode;
}

const THEME_CONFIG: ThemeConfig = {
  token: {
    colorPrimary: '#5222D8',
    colorPrimaryBorder: '#c5a3ff',
    colorPrimaryBorderHover: '#9e74f2',
    colorPrimaryHover: '#7849e6',
    colorPrimaryTextActive: '#FFFFFF',
    controlHeight: 48,
    colorError: '#B7142D',
    colorText: '#FFF',
    borderRadius: 16,
  },
  components: {
    Form: {
      labelColor: '#E0E0E0',
      labelFontSize: 16,
      itemMarginBottom: 24,
    },
    Slider: {
      handleLineWidth: 2,
      handleLineWidthHover: 2,
      handleSize: 12, // 1 + 10 + 1 = 12
      handleSizeHover: 12, // 2 + 12 + 2 = 16
      trackBg: '#5222D8',
      trackHoverBg: '#5222D8',
      handleColor: '#5222D8',
      handleActiveColor: '#5222D8',
    },
    Radio: {
      buttonCheckedBg: '#FFC0CB', // pink
      buttonSolidCheckedActiveBg: '#FFFF00', // yellow
      buttonSolidCheckedBg: '#0000FF', // blue
      buttonSolidCheckedColor: '#FF0000', // red
      buttonSolidCheckedHoverBg: '#008000', // green
    },
  },
};

const CUSTOM_TOKEN: IAelfdCustomToken = {
  customAddress: {
    primaryLinkColor: '#434343',
    primaryIconColor: '#B8B8B8',
    addressHoverColor: '#ffb854',
    addressActiveColor: '#d47a19',
  },
};
export default function AELFDProviderWrap(props: IProps) {
  const { children } = props;
  return (
    <AELFDProvider
      prefixCls={PREFIXCLS}
      theme={THEME_CONFIG}
      customToken={CUSTOM_TOKEN}
      themeMode="dark"
    >
      <ConfigProvider locale={en_US} prefixCls={PREFIXCLS} theme={THEME_CONFIG}>
        <MobileConfigProvider locale={enUS}>{children}</MobileConfigProvider>
      </ConfigProvider>
    </AELFDProvider>
  );
}
