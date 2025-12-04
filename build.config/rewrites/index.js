const devConfig = require('./development');
const proConfig = require('./production');
const { NODE_ENV, APP_ENV } = process.env;

console.log('rewrites ENV', NODE_ENV, APP_ENV);
module.exports = APP_ENV === 'mainnet' ? proConfig : devConfig;
