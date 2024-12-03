/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,css}'],
  theme: {
    extend: {
      fontFamily: {
        'sf-pro-text': [
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          "'Helvetica Neue'",
          'Arial',
          'sans-serif',
        ],
        'sf-pro': [
          'SF Pro',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          "'Helvetica Neue'",
          'Arial',
          'sans-serif',
        ],
        Montserrat: ['Montserrat', 'sans-serif'],
        Unbounded: ['Unbounded', 'sans-serif'],
        Syne: ['Syne', 'sans-serif'],
      },
      animation: {
        vibrate: 'vibrate 100ms linear 4',
        flash: 'flash 1s infinite',
        skeleton: 'skeleton 1.5s ease-in-out infinite',
        'scroll-left': 'scroll-left 10s linear infinite',
        'up-down': 'upDown 3s ease-in-out infinite',
      },
      keyframes: {
        vibrate: {
          '0%, 100%': { transform: 'translate(0)' },
          '25%': { transform: 'translate(3px, 3px)' },
          '50%': { transform: 'translate(-3px, -3px)' },
          '75%': { transform: 'translate(3px, -3px)' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        skeleton: {
          '0%, 100%': { backgroundColor: '#353535' },
          '50%': { backgroundColor: '#1c1a1a' },
        },
        upDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
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
        baseBg: 'var(--base-bg)',
        baseText: 'var(--base-text)',
        fillBg: 'var(--fill-bg)',
        fillBg8: 'var(--fill-bg-8)',
        fillBg40: 'var(--fill-bg-40)',
        fillBlack15: 'var(--fill-black-15)',
        mainColor: 'var(--main-color)',
        darkGray: 'var(--dark-gray)',
        lightGrey: 'var(--light-gray)',
      },
      flex: {
        quarter: '1 1 25%',
        half: '1 1 50%',
      },
      backgroundImage: {
        itemShadow:
          'linear-gradient(29deg, #5D49F6 9.71%, rgba(255, 255, 255, 0.2) 40%, rgba(255, 255, 255, 0.2) 100%)',
      },
    },
    screens: {
      sm: '375px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
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
    ({ addComponents }) => {
      addComponents({
        '.tmrwdao-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '0.375rem',
          margin: '0 auto',
          width: '100%',
          maxWidth: '1120px',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 1.25rem',
          boxSizing: 'border-box',
          '@screen md': {
            padding: '0 2.5rem',
          },
          '@screen lg': {
            padding: '0 3.75rem',
            gap: '1.25rem',
          },
          '@screen xl': {
            padding: '0',
          },
        },
        ...Array.from({ length: 12 }, (_, i) => i + 1).reduce((acc, col) => {
          acc[`.col-${col}`] = {
            gridColumn: `span ${col} / span ${col}`,
          };
          acc[`.offset-${col}`] = {
            gridColumnStart: `${col + 1} !important`,
          };
          return acc;
        }, {}),
      });
    },
  ],
  corePlugins: {
    preflight: false,
  },
};
