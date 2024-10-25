// const withLess = require('next-with-less');
module.exports = [
  (nextConfig) => {
    return {
      ...nextConfig,
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'testnet1-tmrwdao.s3.amazonaws.com',
            port: '',
            pathname: '/DAO/**',
          },
          {
            protocol: 'https',
            hostname: 'tmrwdao.com',
            port: '',
            pathname: '/cms/**',
          },
        ],
      },
    };
  },
];
