
let instance;

export class WebLoginInstance {
  _context = {};
  static get() {
    if (!instance) {
      instance = new WebLoginInstance();
    }
    return instance;
  }

  setWebLoginContext(context) {
    this._context = context;
  }

  isAccountInfoSynced() {
    return this._context.accountInfoSync.syncCompleted;
  }

  getWebLoginContext() {
    return this._context;
  }

  callContract(params) {
    return this._context.callSendMethod(params);
  }

  async loginAsync() {
    return new Promise((resolve, reject) => {
      this._loginResolve = resolve;
      this._loginReject = reject;
      this._context.connectWallet();
    });
  }

  async logoutAsync() {
    return new Promise((resolve, reject) => {
      this._logoutResolve = resolve;
      this._logoutReject = reject;
      this._context.disConnectWallet();
    });
  }
}
