/**
 * @file getLogin.js
 * @author zhouminghui
*/
// import isMobile from 'ismobilejs';
import contracts from './contracts';
import config from '../../_src/config/config';

// const isPhone = isMobile(window.navigator).phone;
const isPhone = false;

// todo: there are three place that has the same payload in contractChange, getLogin, can I optimize it?
let getLoginLock = false;
let getLoginQueue = [];
let getLoginTimer = null;
export default function getLogin(nightElf, payload, callback, useLock = true) {
  getLoginQueue.push({
    nightElf, payload, callback, useLock,
  });
  if (getLoginTimer) {
    clearTimeout(getLoginTimer);
  }
  getLoginTimer = setTimeout(() => {
    nightELFLogin(true);
  }, 200);
}

function nightELFLogin(useLock) {
  if ((getLoginQueue.length <= 0 || getLoginLock) && useLock) {
    return;
  }
  if (!getLoginQueue.length) {
    return;
  }
  getLoginLock = true;

  setTimeout(() => {
    getLoginLock = false;
  }, isPhone ? 5000 : 1500);

  const param = getLoginQueue.shift();
  // const {nightElf, payload, callback, useLock} = param;
  const { nightElf, callback } = param;
  nightElf.login({
    appName: config.APPNAME,
    payload: {
      method: 'LOGIN',
      contracts,
    },
  }, (error, result) => {
    // console.log('this.getCurrentWalletLock getLogin', error, result, getLoginQueue.length);
    if (result) {
      callback(result);
      if (result.error === 200010) {
        getLoginQueue = [];
      }
    }
    getLoginLock = false;
    nightELFLogin();
  });
}
