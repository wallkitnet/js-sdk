import Cookies from './utils/Cookies';


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
    constructor({value, refresh, expire}) {

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
    }

    exist() {

      if(this.value && typeof this.value !== "undefined")
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
        // set cookie on year
        let expires = Infinity;
        //Cookies.setItem(`_wk_token_${Config.resource}`,JSON.stringify(this), expires, '/');
        Cookies.setItem('wk-token',this.value, expires, '/');
        if(typeof this.refresh !== "undefined")
        {
          Cookies.setItem('wk-refresh',this.refresh, Infinity, '/');
        }
    }
}
WallkitToken.storageKey = 'WallkitToken';

/**
 * Deserialize token from localStorage and creates instance of {@link WallkitToken}
 *
 * @public
 * @return {WallkitToken} - return WallkitToken instance
 *
 * @example
 * WallkitToken.deserialize();
 */
WallkitToken.deserialize = function () {
    //let data = JSON.parse(Cookies.getItem(`_wk_token_${Config.resource}`));
    let data = Cookies.getItem('wk-token');
    let refresh = Cookies.getItem('wk-refresh');

    if (data || refresh) {
      return new WallkitToken({value: data, refresh: refresh});
    }
    return null
};
