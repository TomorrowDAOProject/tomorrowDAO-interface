/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const { ANALYZE, NODE_ENV, NO_DRY_RUN } = process.env;
const pluginConfig = require('./build.config/plugin');
const development = require('./build.config/development');
const production = require('./build.config/production');
const path = require('path');
// Injected content via Sentry wizard below
const { withSentryConfig } = require('@sentry/nextjs');

let config = ANALYZE === 'true' || NODE_ENV === 'production' ? production : development;

module.exports = withPlugins(
  [
    ...pluginConfig,
    withSentryConfig(config, {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      include: [],
      dryRun: !NO_DRY_RUN,
      sourcemaps: {
        disable: true,
      },
      org: 'dao-3l',
      project: 'tmrw',
      autoInstrumentServerFunctions: true,
    }),
    (config) => ({
      ...config,
      ...(process.env.NEXT_PUBLIC_STANDALONE
        ? {
            output: 'standalone',
            experimental: {
              ...config.experimental,
              outputFileTracingRoot: path.join(__dirname, './'),
              forceSwcTransforms: true,
              // TODO - doesn't seem to work?
              optimizePackageImports: ['lodash', 'react-use'],
            },
          }
        : {}),
    }),
  ],
  config,
);