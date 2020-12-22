import LocalStorage from './utils/LocalStorage';

const FIREBASE_TOKEN_KEY = 'firebase-token';

export default class WallkitFirebase {
  constructor() {
    this.token = this.getStoredFirebaseToken() || null;
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
    return LocalStorage.setItem(FIREBASE_TOKEN_KEY, token);
  }

  getStoredFirebaseToken() {
    return LocalStorage.getItem(FIREBASE_TOKEN_KEY);
  }

  removeFirebaseTokenFromStorage() {
    return LocalStorage.removeItem(FIREBASE_TOKEN_KEY);
  }

  removeFirebaseToken() {
    this.token = null;
    this.removeFirebaseTokenFromStorage();
  }
}