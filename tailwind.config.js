/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,css}'],
  theme: {
    extend: {
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
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
