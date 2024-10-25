/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,css}'],
  theme: {
    extend: {
      animation: {
        vibrate: 'vibrate 100ms linear 4',
      },
      keyframes: {
        vibrate: {
          '0%, 100%': { transform: 'translate(0)' },
          '25%': { transform: 'translate(3px, 3px)' },
          '50%': { transform: 'translate(-3px, -3px)' },
          '75%': { transform: 'translate(3px, -3px)' },
        },
      },
      colors: {
        neutralTitle: '#1A1A1A',
        neutralPrimaryText: '#434343',
        baseBorder: '#EDEDED',
        colorPrimary: '#FA9D2B',
        colorPrimaryHover: '#ffb854',
        colorPrimaryActive: '#d47a19',
        approve: '#3888FF',
        rejection: '#F55D6E',
        abstention: '#687083',
        error: '#f55d6e',
        'Neutral-Secondary-Text': '#919191',
        'Primary-Text': '#1A1A1A',
        'Neutral-Primary-Text': '#434343',
        'Neutral-Divider': '#EDEDED',
        'Neutral-Border': '#E1E1E1',
        'Neutral-Disable-Text': '#B8B8B8',
        'Brand-Brand': '#FA9D2B',
        'Brand-Brand-BG': '#F2EEFF',
        'Brand-hover': '#ffb854',
        'Brand-click': '#d47a19',
        'Neutral-Hover-BG': '#FAFAFA',
        'Neutral-Default-BG': '#F6F6F6',
        'Disable-Text': '#B8B8B8',
        'Active-Text': '#F8B042',
        'Reject-Reject': '#F55D6E',
        'Light-Mode-Brand-Brand': '#127FFF',
        link: '#5b8ef4',
      },
      flex: {
        quarter: '1 1 25%',
        half: '1 1 50%',
      },
    },
    screens: {
      xs: '480px',
      sm: '641px',
      md: '769px',
      lg: '1025px',
      xl: '1281px',
      '2xl': '1537',
      homePc: '768px',
    },
  },
  plugins: [
    plugin(function ({ addUtilities, addComponents, e, config }) {
      // Add your custom styles here
      addComponents({
        '.button-border-normal': {
          '@apply border-solid border border-Neutral-Divider': {},
        },

        '.page-content-padding': {
          '@apply px-4 lg:px-8 pb-4 lg:pb-8': {},
        },

        '.page-content-bg-border': {
          '@apply bg-white rounded-lg border border-solid border-Neutral-Divider px-4 lg:px-8 py-4 lg:py-8':
            {},
        },

        '.card-shape': {
          '@apply bg-white rounded-lg border border-solid border-Neutral-Divider': {},
        },
        '.card-px': {
          '@apply px-4 lg:px-8': {},
        },
        '.tabpanel-content-padding': {
          '@apply px-4 lg:px-8 pb-4': {},
        },

        '.dao-border-round': {
          '@apply button-border-normal rounded-lg': {},
        },
        '.normal-text': {
          '@apply text-[16px] leading-[24px] text-neutralTitle': {},
        },
        '.normal-text-bold': {
          '@apply text-[16px] leading-[24px] text-neutralTitle font-medium': {},
        },

        '.form-item-title': {
          '@apply text-[16px] leading-[24px] text-neutralPrimaryText font-medium': {},
        },

        '.dao-detail-card': {
          '@apply border-0 lg:border lg:mb-[10px] border-Neutral-Divider border-solid rounded-lg bg-white px-4 lg:px-8 lg:py-6 pt-[8px] pb-[24px]':
            {},
        },

        '.card-title': {
          '@apply text-[20px] leading-[28px] text-neutralTitle font-medium': {},
        },
        '.card-sm-text': {
          '@apply text-[14px] leading-[22px]': {},
        },
        '.card-sm-text-black': {
          '@apply text-[14px] leading-[22px] text-neutralTitle': {},
        },
        '.card-xsm-text': {
          '@apply text-[12px] leading-[20px]': {},
        },
        '.card-sm-text-bold': {
          '@apply text-[14px] leading-[22px] font-medium': {},
        },

        '.card-title-lg': {
          '@apply text-[24px] leading-[32px] text-neutralTitle font-medium': {},
        },
        '.error-text': {
          '@apply text-error h-[32px] flex items-center': {},
        },
        '.table-title-text': {
          '@apply text-[14px] leading-[20px] text-Neutral-Secondary-Text font-medium': {},
        },
        '.flex-center': {
          '@apply flex items-center justify-center': {},
        },
        '.max-content': {
          width: ' max-content',
        },
        '.proposal-item-left-width': {
          'max-width': 'calc(100% - 266px - 48px)',
        },
      });
    }),
  ],
  corePlugins: {
    preflight: false,
  },
};
