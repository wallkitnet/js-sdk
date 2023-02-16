import Cookies from './utils/Cookies';
import LocalStorage from './utils/LocalStorage';
import Resource from './utils/Resource';
import { getDomainWithoutSubdomain } from "./utils/Location";
import Config from './Config';

/**
 * Class to manipulate with Tokens.
 *
 * @public
 */
export default class WallkitToken {
    /**
     * Constructor for WallkitToken Class.
     *
     * @param {object} object token
     * @property {string} value - token key
     * @property {number} expire - timestamp of token expire
     *
     * @example
     * let token = new WallkitToken({
     *  value: "0b0f8ef5b5c4f3bf2f332a79d323b427a9c30676",
     *  expire: "1553700315"
     * });
     */
    constructor({value, refresh, expire, resource}) {

    /**
       * @type {string} value - token key
       */
      this.value = value;

      /**
       * @type {string} value - refresh token key
       */
      this.refresh = refresh;

      /**
       * @type {number} expire - timestamp of token expire
       */
      this.expire = expire;

      /**
       * @type {string} resource - resource key
       */
      this.resource = resource;
      // /**
      //  * @type {Object} keys for access the storage
      //  */
      // this.storageKeys = {
      //   refresh: Resource.formatKey('wk-refresh', resource),
      //   token: Resource.formatKey('wk-token', resource),
      // }
    }


    get getResource() {
      if (typeof this.resource === 'object' && this.resource) {
        return this.resource.public_key;
      }

      return this.resource;
    }

    exist() {

      if (this.value && typeof this.value !== "undefined")
      {
        return true;
      }

      return false;
    }

    /**
     * Serialize token instance and insert it in localstorage
     *
     * @public
     * @return void
     *
     * @example
     * WallkitToken.serialize();
     */
    serialize() {
      if(typeof this.value !== "undefined" && this.value) {
        Cookies.setItem(WallkitToken.getStorageKey(this.getResource), this.value, Infinity, '/', Cookies.cookieDomain());
      }

      if(typeof this.refresh !== "undefined") {
        Cookies.setItem(WallkitToken.getRefreshKey(this.getResource), this.refresh, Infinity, '/', Cookies.cookieDomain());
      }

      return LocalStorage.setItem(WallkitToken.getStorageKey(this.getResource), JSON.stringify(this));
    }
}

WallkitToken.storageKey = 'WallkitToken';
WallkitToken.storageRefreshKey = 'WallkitRefreshToken';

WallkitToken.getStorageKey = (resource) => {
  if (resource) {
    return Resource.formatKey(WallkitToken.storageKey, resource);
  }

  return WallkitToken.storageKey;
}

WallkitToken.getRefreshKey = (resource) => {
  if (resource) {
    return Resource.formatKey(WallkitToken.storageRefreshKey, resource);
  }

  return WallkitToken.storageKey;
}

/**
 * Deserialize token from localStorage and creates instance of {@link WallkitToken}
 *
 * @public
 * @return {WallkitToken} - return WallkitToken instance
 *
 * @example
 * WallkitToken.deserialize();
 */
WallkitToken.deserialize = function (resource) {
    const wkTokenStorageKey = Resource.formatKey(WallkitToken.storageKey, resource);
    const wkRefreshTokenStorageKey = Resource.formatKey(WallkitToken.storageRefreshKey, resource);

    let data = Cookies.getItem(wkTokenStorageKey);
    let refresh = Cookies.getItem(wkRefreshTokenStorageKey);

    if (data || refresh) {
      return new WallkitToken({
        value: data,
        refresh: refresh,
        resource: resource
      });
    }

    let storedToken = JSON.parse(LocalStorage.getItem(wkTokenStorageKey));

    if (storedToken && storedToken.value)
    {
      Cookies.setItem(wkTokenStorageKey, storedToken.value, Infinity, '/');

      if(typeof storedToken.refresh !== "undefined")
      {
        Cookies.setItem(wkRefreshTokenStorageKey, storedToken.refresh, Infinity, '/');
      }
      return new WallkitToken(storedToken);
    }

    return null
};

/**
 * Remove tokens from the storage
 *
 * @public
 * @return void
 *
 * @example
 * WallkitToken.remove();
 */
WallkitToken.remove = function (resource) {
  const wkTokenStorageKey = Resource.formatKey(WallkitToken.storageKey, resource);
  const wkRefreshTokenStorageKey = Resource.formatKey(WallkitToken.storageRefreshKey, resource);

  Cookies.removeItem(wkTokenStorageKey, '/', Cookies.cookieDomain());
  Cookies.removeItem(wkRefreshTokenStorageKey, '/', Cookies.cookieDomain());

  if (LocalStorage.isAvailable()) {
    LocalStorage.removeItem(wkTokenStorageKey);
    LocalStorage.removeItem(wkRefreshTokenStorageKey);
  }
}
