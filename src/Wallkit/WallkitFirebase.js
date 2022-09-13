import LocalStorage from './utils/LocalStorage';

const FIREBASE_TOKEN_KEY = 'firebase-token';

export default class WallkitFirebase {
  constructor(resource) {
    this.token = this.getStoredFirebaseToken() || null;
    this.resource = resource;
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
    return LocalStorage.getItem(this.tokenKey);
  }

  removeFirebaseTokenFromStorage() {
    return LocalStorage.removeItem(this.tokenKey);
  }

  removeFirebaseToken() {
    this.token = null;
    this.removeFirebaseTokenFromStorage();
  }
}