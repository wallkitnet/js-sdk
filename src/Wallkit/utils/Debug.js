const Debug = {
  log(...message) {
    if (!this.getDebugMode()) return;
    console.log(...message);
  },
  setDebugMode(debugMode = false) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('debug-wk-sdk', debugMode);
  },
  getDebugMode() {
    if (typeof localStorage === 'undefined') return false;

    return localStorage.getItem('debug-wk-sdk') === 'true';
  }
}

export default Debug;


