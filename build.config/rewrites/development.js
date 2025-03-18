module.exports = [
  {
    source: '/cms/:path*',
    destination: 'https://test.tmrwdao.com/cms/:path*',
  },
  {
    source: '/explorer-api/:path*',
    destination: 'https://testnet.aelfscan.io/api/:path*',
  },
  {
    source: '/token-price-api/:path*',
    destination: 'https://explorer.aelf.io/api/:path*',
  },
  {
    source: '/side-explorer-api/:path*',
    destination: 'https://testnet.aelfscan.io/api/:path*',
  },
];
