/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const { ANALYZE, NODE_ENV, NO_DRY_RUN, STANDALONE } = process.env;
const pluginConfig = require('./build.config/plugin');
const development = require('./build.config/development');
const production = require('./build.config/production');

let config = ANALYZE === 'true' || NODE_ENV === 'production' ? production : development;
config = {
  ...config,
  ...(STANDALONE
    ? {
        output: 'standalone',
      }
    : {}),
};

module.exports = withPlugins(pluginConfig, config);

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
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
});
