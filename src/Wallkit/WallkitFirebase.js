import LocalStorage from './utils/LocalStorage';
import Cookies from "./utils/Cookies";

const FIREBASE_TOKEN_KEY = 'firebase-token';

export default class WallkitFirebase {
  constructor(resource, enabled) {
    this.enabled = enabled !== false;
    this.resource = resource;
    this.token = this.getStoredFirebaseToken() || null;
  }

  get tokenKey() {
    return `${FIREBASE_TOKEN_KEY}_${this.resource}`;
  }

  get getToken() {
    return this.token || null;
  }

  setFirebaseToken(token) {
    if (!token) throw new Error('Token is not provided');

    this.token = token;

    this.storeFirebaseToken(token);

    return token;
  }

  storeFirebaseToken(token) {
    return LocalStorage.setItem(this.tokenKey, token);
  }

  getStoredFirebaseToken() {
    return LocalStorage.getItem(this.tokenKey) || Cookies.getItem(this.tokenKey);
  }

  removeFirebaseTokenFromStorage() {
    return LocalStorage.removeItem(this.tokenKey);
  }

  removeFirebaseToken() {
    this.token = null;
    this.removeFirebaseTokenFromStorage();
    this.removeFirebaseTokenFromCookie();
  }

  removeFirebaseTokenFromCookie() {
    Cookies.removeItem(this.tokenKey, '/', Cookies.cookieDomain());
  }
}
