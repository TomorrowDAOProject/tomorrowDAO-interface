import { ThemeConfig } from 'antd';
import { IAelfdCustomToken } from 'aelf-design/dist/esm/provider';
export const PREFIXCLS = 'TMRWDAO';

export const THEME_CONFIG: ThemeConfig = {
  token: {
    colorPrimary: '#5D49F6',
    colorPrimaryHover: '#ffb854',
    colorPrimaryActive: '#d47a19',
    colorBorder: '#E1E1E1',
    colorPrimaryBorder: '#EDEDED',
    controlHeight: 48,
    colorError: '#F55D6E',
  },
  components: {
    Form: {
      labelColor: '#434343',
      labelFontSize: 16,
      itemMarginBottom: 32,
    },
    Steps: {
      iconSize: 40,
      controlHeight: 40,
      finishIconBorderColor: '#FA9D2B',
    },
    Slider: {
      handleSize: 8,
      handleSizeHover: 10,
      railSize: 8,
    },
    Tabs: {
      horizontalItemPadding: '17px 32px',
      horizontalItemPaddingSM: '17px 16px',
    },
    Table: {
      // borderColor: '#fff',
      headerSplitColor: '#fff',
      headerSortActiveBg: '#fff',
      headerBg: '#FFFFFF',
    },
    Button: {
      colorPrimary: '#5D49F6',
    },
  },
};

export const CUSTOM_TOKEN: IAelfdCustomToken = {
  customAddress: {
    primaryLinkColor: '#434343',
    primaryIconColor: '#B8B8B8',
    addressHoverColor: '#ffb854',
    addressActiveColor: '#d47a19',
  },
};
