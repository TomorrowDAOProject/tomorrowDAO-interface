/**
 * @file config
 * @author atom-yang
 */

import viewerInfo from '../config/viewer/config.js'

const { originQueriedConfig } = viewerInfo;
export default {
  ...originQueriedConfig,
  API_PATH: {
    GET_TOKEN_LIST: "/proposal/tokenList",
  },
};
