import Config from './Config';
import client from './WallkitClient';
import User from './WallkitUser';
import Resource from './WallkitResource';
import Token from './WallkitToken';
import Cookies from './utils/Cookies';
import {isEmpty} from 'lodash';
import Event from './utils/Events';

/**
 * Base Class.
 * @public
 */
class Wallkit {
    /**
     * Wallkit Base Class Constructor.
     */
    constructor() {
        /**
         * Shows Wallkit has initialized.
         * @type {boolean}
         */
        this.initialized = false;
    }

    /**
     * Method showing value with Wallkit LOG in console,  if Config.debug enabled.
     *
     * @public
     * @param {string, number} log - string value to show in console
     * @return void
     *
     * @example
     * Wallkit.log('Some data'); // Wallkit LOG: Some data
     */
    log(log) {
        if (Config.debug) {
            console.log("Wallkit LOG: ", log);
        }
    }

    /**
     * Method inits Wallkit.
     *
     * @public
     * @param {object} config - config instance
     *
     * @example
     * Wallkit.init({
     *    resource: "3535",
     *    version: "v1",
     *    host: "api.dev.wallkit.net",
     * });
     *
     */
    init({resource, api_url}) {
      if (this.initialized)
          return true;

      Config.resource = resource;

      if(typeof api_url !== "undefined")
        Config.api_url = api_url;

      /**
      * User information.
      * @type {WallkitUser}
      */
      this.user = User.deserialize();

      /**
       * Token.
       * @type {Object}
       */
      this.token = Token.deserialize();

      /**
       * Resource
       */
      this.resource = Resource.deserialize();

      /**
       * check and retrieve user if exist token on token not match
       */
      if(this.user === null && this.token ||
        (!isEmpty(this.user) && !isEmpty(this.user.token) && !isEmpty(this.token) && this.user.token !== this.token.value)
      )
      {
        this.getUser()
          .catch(e => {

          });
      }


      /**
       * reload resource
       */
      if(!this.resource && this.token)
      {
        this.getResource();
      }

      /**
         * Client instance to Manipulate with API.
         * @link WallkitClient
         * @type {WallkitClient}
         */
        this.client = client;
        /**
         * Wallkit Config instance.
         * @type {Object}
         */
        this.config = Config;

        this.initListener();

        return this.initialized = true;
    }

    /**
     * Method handle Event Listeners callback.
     *
     * @private
     * @return void
     *
     * @ignore
     */
    listener(event) {

      //console.log("event:::", event);

        /*if (typeof event.data.type !== "undefined") {
            switch (event.data.type) {
                case "wk_token":
                    this.log("wk_token: " + event.data.data);
                    this.authUserByToken(event.data.data);
                    break;
                case "authorizationUser":
                    this.log("authorizationUser: " + event.data);

                    this.log(event.data);

                    if (event.data.token) {
                        this.authUserByToken(event.data.token, "authorizationUser");
                    }
                    break;
                case "registrationUser":
                    this.log("registrationUser: " + event.data);
                    if (event.data.token) {
                        this.authUserByToken(event.data.token, "registrationUser", event.data);
                    }
                    break;
                default:
                    console.log("default");
            }
        }*/
    }

    /**
     * Method init Event Listeners for messages.
     *
     * @private
     * @return void
     *
     * @ignore
     */
    initListener() {
        if (window.addEventListener) {
            window.addEventListener("message", this.listener.bind(this));
        } else {
            // IE8
            window.attachEvent("onmessage", this.listener.bind(this));
        }
    }

    /**
     * Method sets token.
     *
     * @public
     * @param {string} token - user token
     * @return void
     */
    setToken(token) {
        this.token = new Token({value: token});
        this.token.serialize();
    }

  /**
   * Returns token object, where value is token.
   *
   * @public
   * @returns {null}
   */
  getToken() {
      if(this.user !== null && typeof this.token !== "undefined" && !isEmpty(this.user.token))
      {
        return this.user.token;
      }

      if(this.token !== null && typeof this.token !== "undefined" && !isEmpty(this.token.value))
      {
        return this.token.value;
      }

      return null;
    }

    /**
     * Method checks is user authenticated.
     *
     * @public
     * @return {Boolean}
     *
     * @example
     * Wallkit.isAuthenticated();
     */
    isAuthenticated() {
        return !!(this.user && this.token);
    }

    /**
     * Method init user by inited token.
     *
     * @public
     * @return {Promise} returns promise with user object
     *
     * @example
     * const token = 'f96b2464-1ec2-4a1b-8c83-1b3aadb1fbb6';
     *
     * Wallkit.setToken(token);
     *
     * Wallkit.checkAuth().then((user) => {
     *      console.log('USER:', user);
     *   }, (error) => {
     *      console.log('ERROR:', error);
     *   });
     */
    checkAuth() {
        if (!this.token)
        {
          return Promise.reject("Unauthorized");
        }

        return client.get({path: '/user'})
            .then(user => {
                this.user = new User(user, true);
                this.user.serialize();
                return this.user
            })
            .catch(e => {
              if(e.statusCode === 401)
              {
                this.token = null
                this.user = null
                localStorage.removeItem(User.storageKey);
                localStorage.removeItem(Token.storageKey);
                Cookies.removeItem('wk-token');
                throw new Error('Unauthorized');
              }
              return Promise.reject(e.response);
            })
    }

    /**
     * Method register user in Wallkit. After success authorization, method initializes token & user instances. Returns Promise with received user object.
     *
     * @public
     * @param {object} data - user information
     * @return {Promise} returns promise with user object
     *
     * @example
     * Wallkit.signUp();
     */
    registration(data) {
        return client.post({path: '/registration', data})
            .then(response => {
                //this.token = new Token({value: response.token});
                this.token = new Token({value: response.token, refresh: response.refresh_token, expire:response.expires});
                this.token.serialize();

                this.user = new User(response, false);
                this.user.serialize();
                Event.send("wk-event-registration", response);
                return this.user;
            })
    }

    /**
     * Method loging user in Wallkit. After success authorization, method initializes token & user instances. Returns Promise with received user object.
     *
     * @public
     * @param {object} data
     * @param {object} data.email - user email
     * @param {object} data.password - user password
     * @return {Promise} returns promise with user object
     *
     * @example
     *let user = {
     *   email: 'dev@gwallkit.net',
     *   password: '******'
     *};
     *
     *Wallkit.login(user)
     *   .then((user) => {
     *      console.log("after login", user);
     *      Wallkit.checkAuth().then(user => {
     *          console.log("after checkAuth", user);
     *      }).catch(error => {
     *          console.log(error);
     *      });
     *   }, (error) => {
     *      console.log('error:', error);
     *   });
     *
     */
    login(data) {
        this.token = null;
        this.user = null;

        localStorage.removeItem(User.storageKey);
        localStorage.removeItem(Token.storageKey);

        return client.post({path: '/authorization', data})
            .then(response => {
                //this.token = new Token({value: response.token});
              this.token = new Token({value: response.token, refresh: response.refresh_token, expire:response.expires});
              this.token.serialize();
              this.user = new User(response, false);
              this.user.serialize();
              Event.send("wk-event-auth", response);
              return this.user;
            })
    }

    /**
     * Method logout user from Wallkit. After success response, method removes token & user instances.  Removes cookies & localstorage datas.
     *
     * @public
     * @return {Promise} returns Promise
     *
     * @example
     * Wallkit.logout().then(() => {
     *   alert('User has logged');
     * });
     */
    logout(event = true) {
      if(event)
      {
        Event.send("wk-event-logout", true);
      }
      this.user = null;
      if(this.token)
      {
        return client.get({path: '/logout'})
          .then(result => {
            this.token = null;
            localStorage.removeItem(User.storageKey);
            localStorage.removeItem(Token.storageKey);
            Cookies.removeItem('wk-token');
            Cookies.removeItem('wk-refresh');
          })
      }
      else
      {
        return new Promise((resolve) => {
          this.token = null;
          localStorage.removeItem(User.storageKey);
          localStorage.removeItem(Token.storageKey);
          Cookies.removeItem('wk-token');
          Cookies.removeItem('wk-refresh');
          resolve(true);
        });
      }
    }

    /**
     * Method inits custom event
     *
     * @private
     * @param {string} event - event name
     * @param {object} params
     * @param {boolean} params.bubbles - event bubble
     * @param {boolean} params.cancelable - if event cancelable
     * @param {object} params.detail - other event details
     * @return {Event} returns event instance
     *
     * @example
     * new this.CustomEvent(eventName + ":success", { bubbles: false, cancelable: false, detail: data })
     */
    /*CustomEvent(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };

      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );

      return evt;
    }*/

    getUser() {
      return User.reload()
        .then(user => {
          this.user = new User(user, true);
          this.user.serialize();
          return this.user
        })
        .catch(e => {
          if(e.statusCode === 401)
          {
            this.token = null
            this.user = null
            this.logout(false);
          }
          return Promise.reject(e.response);
        })
    }


  /**
   * Method authenticate user by provided token and auth method type(authorizationUser/registrationUser).
   * @param token
   * @returns {Promise<any>}
   */
  authUserByToken(token = false) {

    if(!token)
    {
      throw new Error('Incorrect token');
    }

    if(this.getToken() !== token)
    {
      this.token = new Token({value: token});
      this.token.serialize();
    }

    return this.getUser()
      .then(user => {
        this.getResource();
        return user
      });
    }

  /**
   * Gets Wallkit's client resource such as `public_key`, `origin`, `payments_in_live_mode`, `stripe_public_key`.
   *
   * @return {Promise}
   */
  getResource() {
    return Resource.reload()
      .then(resource => {
        this.resource = new Resource(resource);
        this.resource.serialize();

        Event.send("wk-event-resource", resource);

        return this.resource
      })
      .catch(e => {
        console.error("ERROR:", e);
        new Error("Resource not configured");
      })
  }

  /**
   * Returns promise with resources object which includes resources array.
   *
   * @returns {Promise<any>}
   */
  getResources() {
    return this.client.get({path: '/resources'})
      .then(response => {
        Event.send("wk-event-resources", response);
        return response;
      })
  }

  /**
   * Reset password by user email.
   *
   * @param {string | object} data - user email
   * @returns {Promise<any>}
   */
  passwordReset(data) {

      if(typeof data !== "object")
      {
        data = {email: data}
      }
      return this.client.post({path: '/reset-password', data: data})
        .then(response => {
          Event.send("wk-event-reset-password", response);
          return response;
        })
  }

  /**
   * Get available subscription for payment
   *
   * @returns {Promise<any>}
   */
  getSubscriptions() {
      return this.client.get({path: '/subscriptions'})
        .then(response => {
          Event.send("wk-event-subscriptions", response);
          return response;
        })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  /*getSubscriptions() {
    console.log("getSubscriptions");
    return this.client.get({path: '/user/subscriptions'})
      .then(response => {
        Event.send("wk-event-user-subscriptions", response);
      })
  }*/

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  calculatePrice(data) {
    return this.client.post({path: '/payment/calculate-price', data: data})
      .then(response => {
        Event.send("wk-event-calculate-price", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  checkOut(data) {
    return this.client.post({path: '/payment', data: data})
      .then(response => {

        this.getUser();

        Event.send("wk-event-transaction", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  validatePromo(data) {
    if(typeof data !== "object")
    {
      data = {promo: data}
    }
    return this.client.post({path: '/promo-validation', data: data})
      .then(response => {
        Event.send("wk-event-promo-validation", response);
        return response;
      })
  }

  /**
   *
   * @param transaction_id
   * @returns {Promise<any>}
   */
  getTransaction(transaction_id) {
    return this.client.get({path: '/user/transactions/' + transaction_id})
      .then(response => {
        //Event.send("wk-event-user-transaction", response);
        return response;
      })
  }

  /**
   *
   * @param transaction_id
   * @returns {Promise<any>}
   */
  getTransactions() {
    return this.client.get({path: '/user/transactions'})
      .then(response => {
        //Event.send("wk-event-user-transaction", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  updateUser(data) {
    return this.client.put({path: '/user', data: data})
      .then(response => {
        this.user = new User(response, false);
        this.user.serialize();
        //Event.send("wk-event-user-update", response);
        return response;
      })
  }

  /**
   * request authorization/refresh
   */
  refreshToken(data) {
    if(!data)
    {
      data = this.token.refresh;
    }

    if(typeof data !== "object")
    {
      data = {refresh_token: data}
    }
    return this.client.post({path: '/authorization/refresh', data: data})
      .then(response => {
        if(!isEmpty(response.token))
        {
          this.token = new Token({value: response.token, refresh: response.refresh_token, expire:response.expires});
          this.token.serialize();
          Event.send("wk-event-token", response.token);
        }
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  updatePassword(data) {
    if(typeof data !== "object")
    {
      data = {new_password: data}
    }
    return this.client.put({path: '/user/password', data: data})
      .then(response => {
        Event.send("wk-event-update-password", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  updateEmail(data) {
    if(typeof data !== "object")
    {
      data = {email: data}
    }
    return this.client.put({path: '/user/email', data: data})
      .then(response => {
        Event.send("wk-event-update-email", response);
        return response;
      })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  suspendMe() {
    return this.client.post({path: '/user/suspend'})
      .then(response => {
        Event.send("wk-event-user-suspend", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  confirmPassword(data) {
    if(typeof data !== "object")
    {
      data = {code: data}
    }
    return this.client.post({path: '/reset-password-validate', data: data})
      .then(response => {
        Event.send("wk-event-confirm-password", response);

        if(!isEmpty(response.token))
        {
          this.token = new Token({value: response.token, refresh: response.refresh_token, expire: response.expires});
          this.token.serialize();

          this.user = new User(response, true);
          this.user.serialize();
        }

        return response;
      })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  resendEmailConfirmation() {
    return this.client.post({path: '/resend-confirmation'})
      .then(response => {
        Event.send("wk-event-resend-confirmation", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  confirmEmail(data) {
    if(typeof data !== "object")
    {
      data = {code: data}
    }
    return this.client.post({path: '/confirm-email', data: data})
      .then(response => {
        Event.send("wk-event-email-confirm", response);
        return response;
      })
  }

  /**
   *
   * @param card_id
   * @returns {Promise<any>}
   */
  removeCard(card_id) {
    return this.client.del({path: '/user/card/'+card_id})
      .then(response => {
        Event.send("wk-event-remove-card", response);
        return response;
      })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  getCards() {
    return this.client.get({path: '/user/cards'})
      .then(response => {
        Event.send("wk-event-cards", response);
        return response;
      })
  }

  /**
   *
   * @param card_id
   * @returns {Promise<any>}
   */
  defaultCard(card_id) {
    return this.client.post({path: '/user/card/'+card_id+'/default'})
      .then(response => {
        Event.send("wk-event-default-card", response);
        return response;
      })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  getCountries() {
    return this.client.get({path: '/countries'})
      .then(response => {
        Event.send("wk-event-countries", response);
        return response;
      })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  getCurrencies() {
    return this.client.get({path: '/currency'})
      .then(response => {
        Event.send("wk-event-currency", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  validateInvite(data) {
    if(typeof data !== "object")
    {
      data = {invite: data}
    }
    return this.client.post({path: '/invite-validation', data: data})
      .then(response => {
        Event.send("wk-event-invite-validation", response);
        return response;
      })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  activateInvite(data) {
    if(typeof data !== "object")
    {
      data = {invite: data}
    }
    return this.client.post({path: '/invite-activation', data: data})
      .then(response => {
        Event.send("wk-event-invite-activation", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  createStripeByToken(data) {
    if(typeof data !== "object")
    {
      data = {token: data}
    }
    return this.client.post({path: '/user/stripe/token', data: data})
      .then(response => {
        Event.send("wk-event-stripe-token", response);
        return response;
      })
  }


  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  validateEmail(data) {
    if(typeof data !== "object")
    {
      data = {email: data}
    }
    return this.client.post({path: '/email-validation', data: data})
      .then(response => {
        Event.send("wk-event-email-validation", response);
        return response;
      })
  }

  /**
   *
   * @param content_key
   * @returns {Promise<any>}
   */
  checkAccess(content_key) {

    if(typeof content_key === "undefined")
    {
      return Promise.reject("Incorrect content key");
    }

    return this.client.get({path: '/user/content/'+content_key})
      .then(response => {
        return response;
      })
  }


  /**
   *
   * @param data
   * @returns {Promise}
   */
  sendEvent(data) {
    if (typeof data !== "object") {
      throw new Error('Event data must be an object.');
    }
    return this.client.post({path: '/user/event', data: data});
  }

  /**
   *
   * @param data
   * @param content_key
   * @returns {Promise<any>}
   */
  sendPageView(data, content_key) {
    if (!data) throw new Error('No argument passed');

    if (typeof data !== "object") {
      data = {
        name: 'page_view',
        value: data,
        content_key: content_key,
      };
    }
    else
    {
      if(typeof data.name === "undefined" || data.name !== "page_view")
      {
        data.name = "page_view";
      }
    }
    return this.sendEvent(data);
  }

}

let instance = new Wallkit();

/**
 * @ignore
 */
export default instance;
