const path = require('path');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const rewritesConfig = require('./rewrites/index');
const ROOT = path.resolve(__dirname, '../src/app/network-dao/');
module.exports = {
  reactStrictMode: false,
  async rewrites() {
    return rewritesConfig;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mypinata.cloud',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'testnet1-tmrwdao.s3.amazonaws.com',
        port: '',
        pathname: '/DAO/**',
      },
      {
        protocol: 'https',
        hostname: 'tmrwdao-mainnet.s3.amazonaws.com',
        port: '',
        pathname: '/DAO/**',
      },
      {
        protocol: 'https',
        hostname: 'test.tmrwdao.com',
        port: '',
        pathname: '/cms/**',
      },
      {
        protocol: 'https',
        hostname: 'tmrwdao.com',
        port: '',
        pathname: '/cms/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.tmrwdao.com',
        port: '',
        pathname: '/assets/**',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { webpack, isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    });
    config.ignoreWarnings = [{ module: /node_modules/ }];
    config.resolve.alias = {
      ...config.resolve.alias,
      '@config': path.resolve(ROOT, '_src/config'),
      '@src': path.resolve(ROOT, '_src'),
      '@pages': path.resolve(ROOT, '_src/pages'),
      '@components': path.resolve(ROOT, '_src/components'),
      '@common': path.resolve(ROOT, '_src/common'),
      '@utils': path.resolve(ROOT, '_src/utils'),
      '@store': path.resolve(ROOT, '_src/store'),
      '@api': path.resolve(ROOT, '_src/api'),
      '@actions': path.resolve(ROOT, '_src/redux/actions/'),
      '@redux': path.resolve(ROOT, '_src/redux/'),
    };

    if (!isServer) {
      config.output.filename = 'static/chunks/[name].[contenthash:32].js';
      config.output.chunkFilename = 'static/chunks/[name].[contenthash:32].js';

      config.output.hashFunction = 'sha256';
      config.output.hashDigestLength = 32;
    }
    // config.module.rules.push({
    //   test: /\.less$/,
    //   use: [
    //     {
    //       loader: MiniCssExtractPlugin.loader,
    //       options: {},
    //     },
    //     'css-loader',
    //     'postcss-loader',
    //     'less-loader',
    //   ],
    // });
    // config.module.rules.push({
    //   test: /\.css$/i,
    //   use: [MiniCssExtractPlugin.loader, 'css-loader'],
    // });
    // config.plugins.push(new MiniCssExtractPlugin());

    return config;
  },
};
