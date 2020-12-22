let LocalStorage = {
  setItem: function (key, value) {
    if (!this.isAvailable()) return null;

    return window.localStorage.setItem(key, value);
  },
  getItem: function (key) {
    if (!this.isAvailable()) return null;

    return window.localStorage.getItem(key);
  },
  removeItem: function (key) {
    if (!this.isAvailable()) return;

    return window.localStorage.removeItem(key);
  },
  isAvailable: function () {
    try {
      localStorage.setItem('', '');
      localStorage.removeItem('');
      return true;
    } catch(e) {
      return false;
    }
  }
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = LocalStorage;
}