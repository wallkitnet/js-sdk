import Config from './Config';
import Debug from './utils/Debug';
import client from './WallkitClient';
import User from './WallkitUser';
import Resource from './WallkitResource';
import Token from './WallkitToken';
import Firebase from './WallkitFirebase';
import Cookies from './utils/Cookies';
import LocalStorage from './utils/LocalStorage';
import Session from './utils/Session';
import isEmpty from 'lodash.isempty';
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
  log(...log) {
    if (Config.debug) {
      console.log(...log);
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
   *    firebase: "true",
   *    subDomainCookie: "true",
   * });
   *
   */
  init({resource, api_url, firebase, subDomainCookie, debug}) {
    if (this.initialized) {
      return true;
    }

    Config.resource = resource;

    if (typeof api_url !== "undefined") {
      Config.api_url = api_url;
    }

    if (typeof subDomainCookie !== "undefined") {
      Config.subDomainCookie = Boolean(subDomainCookie);
    }

    if (typeof debug !== "undefined") {
        Config.debug = Boolean(debug);
    }

    /**
     * User information.
     * @type {WallkitUser}
     */
    this.user = User.deserialize(resource);

    /**
     * Token.
     * @type {Object}
     */
    this.token = Token.deserialize(resource);

    /**
     * Firebase Token.
     * @type {Object}
     */
    this.firebase = new Firebase(resource, firebase);

    /**
     * Resource
     */
    this.resource = Resource.deserialize(resource);

    /**
     * check and retrieve user if exist token on token not match
     */
    if (this.user === null && this.token && this.firebase.enabled === false ||
        this.user === null && this.token && this.firebase.token ||
        (!isEmpty(this.user) && !isEmpty(this.user.token) && !isEmpty(this.token) && !isEmpty(this.firebase.token) && this.user.token !== this.token.value)
    ) {
      this.getUser()
          .catch(e => {

          });
    }


    /**
     * reload resource
     */
    if (!this.resource && this.token) {
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

    /**
     * Wallkit Events Callbacks.
     * @type {Array}
     */
    this.callbacks = [];

    this.initListener();

    this.isLocalStorageAvailable = LocalStorage.isAvailable();

    Debug.setDebugMode(Config.debug);

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

    if (typeof event.origin !== "undefined" &&
        typeof document !== "undefined" &&
        Resource.hasOrigin(event.origin) &&
        event.origin !== document.location.origin &&
        typeof event === "object" &&
        typeof event.data === "object" &&
        typeof event.data.name !== "undefined" &&
        typeof event.data.value !== "undefined") {
        this.log("WkJsSDK <==", event.data);

      switch (event.data.name) {
        case "wk-event-registration" :
        case "wk-event-auth" :
        case "wk-event-user" :
        case "wk-event-user-update" :
        case "wk-event-confirm-password" :

          if (typeof event.data.value.token !== "undefined") {
            this.token = new Token({
              value: event.data.value.token,
              refresh: event.data.value.refresh_token,
              expire: event.data.value.expires,
              resource: Config.resource
            });
            this.token.serialize();
          }

          this.user = new User(event.data.value, false);
          this.user.serialize(Config.resource);
          this.dispatchLocalEvent('user', this.user);
          break;
        //
        // case "wk-event-logout" :
        //   User.remove(Config.resource);
        //   Token.remove(Config.resource);
        //   this.token = null;
        //   this.user = null;
        //
        //   if (this.firebase.token) {
        //     this.firebase.removeFirebaseToken();
        //   }
        //
        //   break;

        case "wk-firebase-token" :
          this.setFirebaseToken(event.data.value);
          break;

        case "wk-event-token" :
          this.token = new Token({
            value: event.data.value,
            refresh: null,
            expire: null,
            resource: Config.resource
          });
          this.token.serialize();
          this.getUser();
          break;

          /*case "wk-event-resource" :
            this.resource = new Resource(event.data.value);
            this.resource.serialize();
            break;*/

        case "wk-event-check-token" :
          if (this.token && typeof this.token.value !== "undefined") {
            Event.send("wk-event-token", this.token.value);
          }
          break;
      }
    }
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
   * Method sends event.
   *
   * @public
   * @param {string} name - event name
   * @param {object} params - params
   */
  dispatchEvent(name, params) {
    Event.send(name, params)
  }

  /**
   * Method sets token.
   *
   * @public
   * @param {string} token - user token
   * @return void
   */
  setToken(token) {
    this.token = new Token({value: token, resource: Config.resource});
    this.token.serialize();
  }

  /**
   * Method sets firebase token.
   *
   * @public
   * @param {string} token - user token
   * @return void
   */
  setFirebaseToken(token) {
    this.firebase.setFirebaseToken(token);
  }

  /**
   * Returns token object, where value is token.
   *
   * @public
   * @returns {null}
   */
  getToken() {
    if (this.user !== null && typeof this.token !== "undefined" && !isEmpty(this.user.token)) {
      return this.user.token;
    }

    if (this.token !== null && typeof this.token !== "undefined" && !isEmpty(this.token.value)) {
      return this.token.value;
    }

    return null;
  }


  /**
   * Returns firebase token.
   *
   * @public
   * @returns {null}
   */
  getFirebaseToken() {
    return this.firebase.getToken;
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
    if (!this.token) {
      return Promise.reject("Unauthorized");
    }

    return client.get({path: '/user'})
        .then(user => {
          this.user = new User(user, true);
          this.user.serialize(Config.resource);
          this.dispatchLocalEvent('user', this.user);
          if (!this.resource && this.token) {
            this.getResource();
          }
          return this.user
        })
        .catch(e => {
          if (e.statusCode === 401) {
            this.token = null;
            this.user = null;
            this.firebase.removeFirebaseToken();
            Token.remove(Config.resource);
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
          this.token = new Token({
            value: response.token,
            refresh: response.refresh_token,
            expire: response.expires,
            resource: Config.resource
          });
          this.token.serialize();

          this.user = new User(response, false);
          this.user.serialize(Config.resource);
          this.dispatchLocalEvent('user', this.user);
          if (!this.resource && this.token) {
            this.getResource();
          }
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
    /* this.token = null;
     this.user = null;

     LocalStorage.removeItem(User.storageKey);
     LocalStorage.removeItem(Token.storageKey);*/

    return client.post({path: '/authorization', data})
        .then(response => {
          this.token = new Token({
            value: response.token,
            refresh: response.refresh_token,
            expire: response.expires,
            resource: Config.resource
          });
          this.token.serialize();
          this.user = new User(response, false);
          this.user.serialize(Config.resource);
          this.dispatchLocalEvent('user', this.user);
          if (!this.resource && this.token) {
            this.getResource();
          }
          Event.send("wk-event-auth", response);
          this.dispatchLocalEvent('auth', response);
          return this.user;
        })
        .catch(e => {

          return Promise.reject(e);
        })
  }

  firebaseAccountSettings() {
    return client.get({path: '/firebase/account'})
      .then(({web_app_config}) => {
        return web_app_config;
      })
      .catch(e => {
        return Promise.reject(e);
      })
  }

  /**
   * Method resets user password by firebase flow.
   *
   * @public
   * @return {Promise} returns Promise
   *
   */
  firebasePasswordReset (email) {
    if (!email) {
      return Promise.reject("Email is not provided");
    }

    return client.post({
      path: '/firebase/password-reset',
      data: {
        email
      }
    })
      .then((data) => {
        Event.send("wk-event-firebase-password-reset", data);
        return data;
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }

  /**
   * Method gets ReCaptcha Settings of Resource.
   *
   * @public
   * @return {Promise} returns Promise
   *
   */
  getReCaptchaSettings() {
    return client.get({path: '/integrations/resource/recaptcha-settings'})
        .then((data) => {
          return data;
        })
        .catch(e => {
          return Promise.reject(e);
        })
  }

  /**
   * Method validates recaptcha token from google.
   *
   * @public
   * @return {Promise} returns Promise
   *
   */
  validateReCaptchaToken(recaptchaToken) {
    if (!recaptchaToken) {
      return Promise.reject("Token is not provided");
    }

    return client.post({
      path: '/integrations/google-recaptcha/validate',
      data: {
        recaptcha_token: recaptchaToken
      },
      options: {
        ignoreTokens: true,
        ignoreSession: true
      }
    }).then((data) => {
      Event.send("wk-event-recaptcha-validate", data);
      return data;
    }).catch((error) => {
      return Promise.reject(error);
    });
  }

  /**
   * Method exchanges Ticket Pass Token on Auth Tokens.
   *
   * @public
   * @return {Promise} returns Promise
   *
   */
  getAuthTokensByTicketPassToken(authToken) {
    if (!authToken) {
      return Promise.reject("Token is not provided");
    }

    return client.post({
        path: '/ti-event/ticket/pass/authorization',
        data: { authorization_token: authToken },
        options: { ignoreTokens: true }
      }).then((data) => {
        Event.send("wk-event-ticket-pass-token", data);
        return data;
      }).catch(e => Promise.reject(e));
  }

  /**
   * Method exchanges external user id on Auth Tokens.
   *
   * @public
   * @return {Promise} returns Promise
   *
   */
  getAuthTokensByExternalUserId(extUserId) {
    if (!extUserId) {
      return Promise.reject("External user id is not provided");
    }

    extUserId = window.btoa(extUserId);

    return client.get({
        path: `/auth/external/${extUserId}`,
        options: { ignoreTokens: true }
      }).then((data) => {
        Event.send("wk-event-external-provider-token", data);
        return data;
      }).catch(e => Promise.reject(e));
  }

  /**
   * Method login user with Firebase.
   *
   * @public
   * @return {Promise} returns Promise
   *
   */
  authenticateWithFirebase(firebase_id_token, captchaToken) {
    if (!firebase_id_token) throw new Error('Token is not provided as argument');

    this.setFirebaseToken(firebase_id_token);
    Session.removeSession();

    return client.post({
      path: '/firebase/oauth/token',
      data: { recaptcha_token: captchaToken },
    }).then((data) => {
        Event.send("wk-event-firebase-auth", {
          wk_token: data.token,
          firebase_token: firebase_id_token
        });
        this.authUserByToken(data.token);
        return data;
      })
      .catch(e => {
        this.firebase.removeFirebaseToken();
        return Promise.reject(e);
      })
  }

  /**
   * Method verifies Firebase Token.
   *
   * @public
   * @return {Promise} returns Promise
   *
   */
  verifyFirebaseToken() {
    return client.post({path: '/firebase/verify-token'})
      .then(({status}) => {
        return status;
      }).catch((error) => {
        this.logout(true);
        return Promise.reject(error);
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
    this.user = null;
    if (this.token) {
      return client.get({path: '/logout'})
          .then(result => {
            return result;
          }).finally(() => {
            this.token = null;
            User.remove(Config.resource);
            Token.remove(Config.resource);
            this.firebase.removeFirebaseToken();

            this.dispatchLocalEvent('logout');
            if (event) {
              Event.send('wk-event-logout', true);
            }
          });
    } else {
      return new Promise((resolve) => {
        this.token = null;
        User.remove(Config.resource);
        Token.remove(Config.resource);
        this.firebase.removeFirebaseToken();
        resolve(true);
      });
    }
  }

  /**
   * Method logout user from Firebase. After success response, method removes firebase token, Wallkit token & user instances.  Removes cookies & localstorage datas.
   *
   * @public
   * @return {Promise} returns Promise
   *
   * @example
   * Wallkit.logout().then(() => {
   *   alert('User has logged');
   * });
   */
  logoutFromFirebase() {
    let removeAllData = () => {
      this.token = null;
      User.remove(Config.resource);
      Token.remove(Config.resource);
      Session.removeSession(Config.resource);
      this.firebase.removeFirebaseToken();
    };

    Event.send("wk-event-logout", true);
    this.user = null;

    if (this.firebase.token) {
      return client.post({path: '/firebase/revoke-token'})
        .then( ({status}) => {
          if (status === true) {
            removeAllData();
            return true;
          }
        });
    } else {
      return new Promise((resolve) => {
        removeAllData();
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
          this.user.serialize(Config.resource);
          if (!this.resource && this.token) {
            this.getResource();
          }
          this.dispatchLocalEvent('user', this.user);
          return this.user
        })
        .catch(e => {
          if (e.statusCode === 401) {
            // this.token = null
            // this.user = null
            this.logout(true);
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

    if (!token) {
      throw new Error('Incorrect token');
    }

    if (this.getToken() !== token) {
      this.token = new Token({
        value: token,
        resource: Config.resource
      });
      this.token.serialize();
      Event.send("wk-event-token", token);
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
          this.dispatchLocalEvent('resource', resource);

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

    if (typeof data !== "object") {
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
  getSubscriptions({page = 1, limit = 10, filter = {"subscriptions.type": "standard"}} = {}) {
    return this.client.get({path: '/subscriptions', params: {page, limit, filter}})
        .then(response => {
          Event.send("wk-event-subscriptions", response);
          return response;
        })
  }


  /**
   * Method sends event.
   *
   * @public
   * @param {number} subscription_id - subscription id
   * @param {boolean} autorenew - autorenew status
   * @returns {Promise<any>}
   */
  changeUserSubscriptionAutorenewStatus(subscription_id, autorenew) {
    return this.client.put({path: `/user/subscriptions/${subscription_id}`, data: {autorenew: autorenew}})
        .then(response => {
          return response;
        })
  }

  /**
   * Method changes user subscription settings.
   *
   * @public
   * @param {number} subscription_id - subscription id
   * @param {object} settings - subscription settings
   * @returns {Promise<any>}
   */
  changeUserSubscriptionSettings(subscription_id, settings) {
    if (typeof subscription_id !== "number") {
      throw new Error('No subscription id provided!');
    }

    if (typeof settings !== "object") {
      throw new Error('No settings provided!');
    }

    return this.client.put({
        path: `/user/subscriptions/${subscription_id}`,
        data: {
          ...settings
        }
      }).then(response => {
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
    if (typeof data !== "object") {
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
          this.user.serialize(Config.resource);
          Event.send("wk-event-user-update", response);
          return response;
        })
        .catch(e => {
            if (e.statusCode === 401) {
                this.token = null;
                this.user = null;
                this.logout(true);
            }
            return Promise.reject(e.response);
        })
  }

  /**
   *
   * Register user using Socials
   *
   * @param data - social response
   * @returns {Promise<any>}
   */
  socialRegistration(data) {
    return client.post({path: '/social-registration', data})
      .then(response => {
        //this.token = new Token({value: response.token});
        this.token = new Token({
          value: response.token,
          refresh: response.refresh_token,
          expire: response.expires,
          resource: Config.resource
        });
        this.token.serialize();

        this.user = new User(response, false);
        this.user.serialize(Config.resource);
        this.dispatchLocalEvent('user', this.user);
        if(!this.resource && this.token)
        {
          this.getResource();
        }
        Event.send("wk-event-registration", response);
        return this.user;
      })
  }

  /**
   *
   * Auth user using Socials
   *
   * @param data - social response
   * @returns {Promise<any>}
   */
  socialAuthorization(data) {
    return client.post({path: '/social-authorization', data})
      .then(response => {
        this.token = new Token({
          value: response.token,
          refresh: response.refresh_token,
          expire: response.expires,
          resource: Config.resource
        });
        this.token.serialize();
        this.user = new User(response, false);
        this.user.serialize(Config.resource);
        this.dispatchLocalEvent('user', this.user);
        if(!this.resource && this.token)
        {
          this.getResource();
        }
        Event.send("wk-event-auth", response);
        return this.user;
      })
      .catch(e => {

        return Promise.reject(e);
      });
  }

  /**
   *
   * Link user social account
   *
   * @param data - social response
   * @returns {Promise<any>}
   */
  linkSocialAccount(data) {
    if (!data) throw new Error('No data provided for social link');

    return client.put({path: '/user/social', data})
      .then(response => {
        return response;
      })
  }

  /**
   *
   * Unlink user social account
   *
   * @param data - social response
   * @returns {Promise<any>}
   */
  unlinkSocialAccount(data) {
    if (!data) throw new Error('No data provided for social unlink');

    if (typeof data !== "object") {
      data = {method: data}
    }

    return client.post({path: '/user/social/delete', data})
      .then(response => {
        return response;
      })
  }

  /**
   * request authorization/refresh
   */
  refreshToken(data) {
    if (!data) {
      data = this.token.refresh;
    }

    if (typeof data !== "object") {
      data = {refresh_token: data}
    }
    return this.client.post({path: '/authorization/refresh', data: data})
        .then(response => {
          if (!isEmpty(response.token)) {
            this.token = new Token({
              value: response.token,
              refresh: response.refresh_token,
              expire: response.expires,
              resource: Config.resource
            });
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
    if (typeof data !== "object") {
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
    if (typeof data !== "object") {
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
  getCampaignMonitorData() {
    return this.client.get({path: '/integrations/campaignmonitor/get-lists'})
        .then(response => {
          return response;
        })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  getUserCampaignMonitorLists() {
    return this.client.get({path: '/integrations/campaignmonitor/interests'})
        .then(response => {
          return response;
        })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  addUserToCampaignMonitorLists(data) {
    return this.client.post({path: '/integrations/campaignmonitor/subscribe', data: data})
        .then(response => {
          return response;
        })
  }

  /**
   *
   * @returns {Promise<any>}
   */
  removeUserFromCampaignMonitorLists(data) {
    return this.client.post({path: '/integrations/campaignmonitor/unsubscribe', data: data})
        .then(response => {
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
    if (typeof data !== "object") {
      data = {code: data}
    }
    return this.client.post({path: '/confirm-password', data: data})
        .then(response => {

          if (!isEmpty(response.token)) {
            this.token = new Token({
              value: response.token,
              refresh: response.refresh_token,
              expire: response.expires,
              resource: Config.resource
            });
            this.token.serialize();

            this.user = new User(response, true);
            this.user.serialize(Config.resource);
            this.dispatchLocalEvent('user', this.user);

            if (!this.resource && this.token) {
              this.getResource();
            }
          }
          Event.send("wk-event-confirm-password", response);
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
    if (typeof data !== "object") {
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
    return this.client.del({path: '/user/card/' + card_id})
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
        .catch(e => {
            if (e.statusCode === 401) {
                this.token = null;
                this.user = null;
                this.logout(true);
            }
            return Promise.reject(e.response);
        })
  }

  /**
   *
   * @param card_id
   * @returns {Promise<any>}
   */
  defaultCard(card_id) {
    return this.client.post({path: '/user/card/' + card_id + '/default'})
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
    if (typeof data !== "object") {
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
    if (typeof data !== "object") {
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
    if (typeof data !== "object") {
      data = {token: data}
    }
    return this.client.post({path: '/user/stripe/token', data: data})
        .then(response => {
          Event.send("wk-event-stripe-token", response);
          return response;
        })
        .catch(e => {
            if (e.statusCode === 401) {
                this.token = null;
                this.user = null;
                this.logout(true);
            }
            return Promise.reject(e.response);
        })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  confirmStripePaymentMethod(data) {
    if (!data) throw new Error('No payment method id passed');

    if(typeof data !== "object")
    {
      data = {payment_method_id: data}
    }
    return this.client.post({path: '/user/stripe/confirm-payment-method', data: data})
      .then(response => {
        Event.send("wk-event-stripe-confirm-payment-method", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  confirmStripePaymentIntent(data) {
    if (!data) throw new Error('No payment intent id passed');

    if(typeof data !== "object")
    {
      data = {payment_intent_id: data}
    }
    return this.client.post({path: '/payment/stripe/confirm-intent', data: data})
      .then(response => {
        Event.send("wk-event-stripe-confirm-payment-intent", response);
        return response;
      })
  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  setupStripeIntent(data) {
      if (!data) throw new Error('No customer passed as argument');

      if(typeof data !== "object")
      {
          data = {customer: data}
      }

      return this.client.post({path: '/payment/stripe/setup-intent', data: data})
          .then(response => {
              Event.send("wk-event-setup-intent", response);
              return response;
          })
  }

  /**
   *
   * @param customerId
   * @returns {Promise<any>}
   */
  removeStripeCustomer(customerId) {
    if (!customerId) throw new Error('No customer id passed as argument');

    return this.client.del({path: `/user/stripe/customer/${customerId}`})
      .then(response => {
        Event.send("wk-event-stripe-customer-delete", response);
        return response;
      })

  }

  /**
   *
   * @param data
   * @returns {Promise<any>}
   */
  validateEmail(data) {
    if (typeof data !== "object") {
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

    if (typeof content_key === "undefined") {
      return Promise.reject("Incorrect content key");
    }

    return this.client.get({path: '/user/content/' + content_key})
        .then(response => {
          return response;
        })
        .catch(e => {
            if (e.statusCode === 401) {
                this.token = null;
                this.user = null;
                this.logout(true);
            }
            return Promise.reject(e.response);
        })
  }


  /**
   *
   * @param content_key
   * @returns {Promise<any>}
   */
  getAccessDetails(content_key) {

    if (typeof content_key === "undefined") {
      return Promise.reject("Incorrect content key");
    }

    return this.client.get({path: '/user/content-access-details/' + content_key})
      .then(response => {
        Event.send('wk-event-access-details', response);
        return response;
      })
      .catch(e => {
        return Promise.reject(e);
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
    } else {
      if (typeof data.name === "undefined" || data.name !== "page_view") {
        data.name = "page_view";
      }
    }
    return this.sendEvent(data);
  }

  subscribeLocalEvent(event, callback) {
    this.callbacks.push({"event": event, "callback": callback});
  }

  unsubscribeLocalEvent(event, callback) {
    this.callbacks = this.callbacks.filter((item) => {
      if (item.event !== event && item.callback !== callback) {
        return true;
      }
    });
  }

  dispatchLocalEvent(event, params) {
    if (this.callbacks.length > 0) {
      this.callbacks.map(item => {
        if (item.event && item.event === event && item.callback) {
          try {
            item.callback(params);
          } catch (e) {
            this.log('Error', e);
          }
        }
      })
    }
  }

  /**
   * Method updates user firestore data.
   *
   * @param data
   * @returns {Promise}
   */
  updateUserFirestore(data) {
    return this.client.put({path: '/firebase/firestore/user', data: {firestore: data}})
      .then(response => {
        Event.send("wk-event-firestore-update", response);
        return response;
      })
      .catch(e => {
        return Promise.reject(e);
      })
  }

  /**
   * Get available event for tickets
   *
   * @returns {Promise<any>}
   */
  getTicketsEvents() {
    return this.client.get({path: '/ti-events'})
      .then(response => {
        Event.send("wk-event-tickets", response);
        return response;
      })
  }

  /**
   * Get available tickets
   *
   * @returns {Promise<any>}
   */
  getTickets(id) {
    return this.client.get({path: `/ti-event/${id}/tickets`})
      .then(response => {
        Event.send("wk-tickets", response);
        return response;
      });
  }

  /**
   * Get user passes tickets
   *
   * @returns {Promise<any>}
   */
  getUserPassesTickets(id) {
    return this.client.get({path: `/user/ti-event/${id}/passes`})
        .then(response => {
          Event.send("wk-tickets-passes", response);
          return response;
      });
  }

  /**
   * Assign tickets
   *
   * @returns {Promise<any>}
   */
  assignTicket(ticketId, userId) {
    return this.client.put({path: `/user/pass/${ticketId}/assign`, data: {assign_id: userId}})
        .then(response => {
          Event.send("wk-tickets", response);
          return response;
        });
  }

  /**
   * Send Ticket Pass Invite to user
   *
   * @param ticketId<string>
   * @param email<string>
   * @returns {Promise<any>}
   */
  sendTicketPassInviteToUser(ticketId, email) {
    return this.client.post({ path: `/user/pass/${ticketId}/invite`, data: { email } })
      .then(response => {
        Event.send("wk-send-ticket-pass-invite", response);
        return response;
      });
  }

  /**
   * Validate Ticket Pass Invite
   *
   * @param code<string>
   * @returns {Promise<any>}
   */
  validateTicketPassInvite(code) {
    return this.client.post({ path: `/ti-event/pass/invite-validation`, data: { code } })
      .then(response => {
        Event.send("wk-validate-ticket-pass-invite", response);
        return response;
      });
  }

  /**
   * Activate Ticket Pass Invite
   *
   * @param code<string>
   * @returns {Promise<any>}
   */
  activateTicketPassInvite(code) {
    return this.client.post({ path: `/ti-event/pass/invite-activation`, data: { code } })
      .then(response => {
        Event.send("wk-activate-ticket-pass-invite", response);
        return response;
      });
  }

  /**
   * Delete Ticket Pass Invite
   *
   * @param passId<string>
   * @returns {Promise<any>}
   */
  removeTicketPassInvite(passId) {
    return this.client.del({ path: `/user/pass/${passId}/invite` })
      .then(response => {
        Event.send("wk-removed-ticket-pass-invite", response);
        return response;
      });
  }

  /**
   * Get User Tickets
   *
   * @returns {Promise<any>}
   */
  getUserTickets() {
    return this.client.get({ path: `/user/ti-event-tickets` })
      .then(response => {
        Event.send("wk-user-tickets", response);
        return response;
      });
  }

  /**
   * Assign Mailchimp Tags to user
   *
   * @returns {Promise<any>}
   */
  assignMailchimpTags(insert_tags) {
    return this.client.post({ path: `/integrations/mailchimp/add-tags` , data: { insert_tags }})
      .then(response => {
        Event.send("wk-mailchimp-assign-tags", response);
        return response;
      });
  }

  /**
   * Ticket Pass Information
   *
   * @param passId<string>
   * @returns {Promise<any>}
   */
  getTicketPassInfo(passId) {
    return this.client.get({ path: `/user/pass/${passId}` })
      .then(response => {
        Event.send("wk-ticket-pass-info", response);
        return response;
      });
  }

  /**
   * Card Attempt
   *
   * @returns {Promise<any>}
   */
   cardAttemptAttach() {
     return this.client.post({ path: '/user/card/attempt-attach' })
         .then(response => {
           Event.send("wk-attempt-attach", response);
           return response;
         });
   }

  /**
   * Checks if user exists in firebase relation
   *
   * @param email<string>
   * @param resources<Array>
   * @returns {Promise<any>}
   */
  checkUserFirebaseRelation (email, resources) {
    if (!email) {
      throw new Error('Email is not provided.');
    }

    const params = new URLSearchParams({
      email: email,
    });

    if (Array.isArray(resources)) {
      resources.forEach((item) => {
        params.set('resources[]', item);
      });
    }

    return this.client.get({
      path: `/firebase/check/email?${params}`
    }).then(response => {
          Event.send("wk-check-user-firebase-relation", response);
          return response;
    });
  }

  /**
   * Cascade Access
   *
   * @returns {Promise<any>}
   */
  cascadeAccess() {
    return this.client.get({ path: '/user/cascade-access' })
        .then(response => {
          Event.send("wk-cascade-access", response);
          return response;
        });
  }

  /**
   * Check User Session
   *
   * @returns {Promise<any>}
   */
  checkUserActivity(email) {
    if (!email) {
      throw new Error('Email is not provided.');
    }

    return this.client.post({ path: '/check-user-activity', data: { email } })
      .then(response => {
        Event.send('wk-check-user-activity', response);
        return response;
      });
  }

  /**
   * Get Stripe Customer from Wallkit API
   * if Stripe Customer already exists for current user - return it
   * if Stripe Customer not exists for current user - create it and return
   * @returns {Promise<any>}
   */
  stripePaymentElementsGetCustomer() {
    return this.client.get({path: '/user/payment-provider/stripe/customer'})
        .then(response => {
          Event.send("wk-event-stripe-payment-elements-get-customer", response);
          return response;
        })
        .catch((e) => {
          Event.send("wk-event-stripe-payment-elements-get-customer", e.response);
          return Promise.reject(e.response);
        });
  }

  /**
   * Setup Intents for Stripe Payment Elements
   * @param wallkitCustomer
   * @returns {Promise<any>}
   */
  stripePaymentElementsSetupIntents(wallkitCustomer) {
    if (!wallkitCustomer) {
      throw new Error('No wallkit customer passed as argument');
    }
    const {payment_customer: {customer_id: stripeCustomerId}} = wallkitCustomer;

    if (!stripeCustomerId) {
      throw new Error('No stripe customer id passed as argument');
    }

    return this.client.post({path: '/user/payment-provider/stripe/setup-intents', data: {stripe_customer_id: stripeCustomerId}})
        .then(response => {
          Event.send("wk-event-stripe-payment-elements-setup-intents", response);
          return response;
        })
        .catch((e) => {
          Event.send("wk-event-stripe-payment-elements-setup-intents", e.response);
          return Promise.reject(e.response);
        });
  }

  /**
   * Save Intents for future payments
   * @param confirmedSetupIntent
   * @returns {Promise<any>}
   */
  stripePaymentElementsSaveIntents(confirmedSetupIntent) {
    if (!confirmedSetupIntent) {
      throw new Error('No confirmedSetupIntent passed as argument');
    }

    return this.client.post({path: '/user/payment-provider/stripe/save-intents', data: {setup_intent: confirmedSetupIntent}})
        .then(response => {
          Event.send("wk-event-stripe-payment-elements-save-intents", response);
          return response;
        })
        .catch((e) => {
          Event.send("wk-event-stripe-payment-elements-save-intents", e.response);
          return Promise.reject(e.response);
        });
  }

  /**
   * Get Payment Sources for Stripe Payment Elements
   *
   * @returns {Promise<any>}
   */
  stripePaymentElementsGetPaymentSources() {
    return this.client.get({path: '/user/payment-sources'})
        .then(response => {
          Event.send("wk-event-stripe-payment-elements-payment-sources", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-stripe-payment-elements-payment-sources", e.response);
          return Promise.reject(e.response);
        })
  }

  /**
   * Set Default Payment Source for Stripe Payment Elements
   *
   * @param id
   * @param sourceType - payment-method or user-card
   * @returns {Promise<any>}
   */
  stripePaymentElementsDefaultPaymentSource(id, sourceType) {
    if (!id) {
      throw new Error('No payment source id passed as argument');
    }

    const allowedPaymentSourceTypes = ['payment-method', 'user-card'];

    if (!allowedPaymentSourceTypes.includes(sourceType)) {
        throw new Error('Incorrect source type passed as argument');
    }

    return this.client.put({path: `/user/payment-sources/${sourceType}/${id}/default`})
        .then(response => {
          Event.send("wk-event-stripe-payment-elements-default-payment-source", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-stripe-payment-elements-default-payment-source", e.response);
          return Promise.reject(e.response);
        })
  }

  /**
   * Remove Payment Source for Stripe Payment Elements
   *
   * @param id
   * @param sourceType - payment-method or user-card
   * @returns {Promise<any>}
   */
  stripePaymentElementsRemovePaymentSource(id, sourceType) {
    if (!id) {
      throw new Error('No payment source id passed as argument');
    }

    const allowedPaymentSourceTypes = ['payment-method', 'user-card'];

    if (!allowedPaymentSourceTypes.includes(sourceType)) {
      throw new Error('Incorrect source type passed as argument');
    }

    return this.client.del({path: `/user/payment-sources/${sourceType}/${id}`})
        .then(response => {
          Event.send("wk-event-stripe-payment-elements-remove-payment-sources", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-stripe-payment-elements-remove-payment-sources", e.response);
          return Promise.reject(e.response);
        })
  }

  /**
   * Invite recipient to sponsored subscription slot
   *
   * @param slotId
   * @param email
   * @returns {Promise<any>}
   * @throws {Error}
   */
  inviteRecipientToSponsoredSubscriptionSlot(slotId, email) {
    if (!slotId) {
      throw new Error('No slot id passed as argument');
    }

    if (!email) {
      throw new Error('No email passed as argument');
    }

    return this.client.put(
        {
          path: `/sponsor/sponsored-subscriptions/slots/${slotId}/invitation`,
          data: {recipient_email: email}
        })
        .then(response => {
          Event.send("wk-event-invite-recipient-to-sponsored-subscription-slot", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-invite-recipient-to-sponsored-subscription-slot", e.response);
          return Promise.reject(e.response);
        })

  }

  getSponsoredSubscriptions() {
    return this.client.get({path: '/sponsor/sponsored-subscriptions'})
        .then(response => {
          Event.send("wk-event-get-sponsored-subscriptions", response);
          return response;
        }).catch(e => {
          Event.send("wk-event-get-sponsored-subscriptions", e.response);
          return Promise.reject(e.response);
        })
  }

  getSponsoredSubscription(id) {
    if (!id) {
      throw new Error('No id passed as argument');
    }

    return this.client.get({path: `/sponsor/sponsored-subscriptions/${id}`})
        .then(response => {
          Event.send("wk-event-get-sponsored-subscription", response);
          return response;
        }).catch(e => {
          Event.send("wk-event-get-sponsored-subscription", e.response);
          return Promise.reject(e.response);
        })
  }

  getSponsoredSubscriptionByGiftCode(giftCode) {
    if (!giftCode) {
      throw new Error('No gift code passed as argument');
    }

    return this.client.get({path: `/recipient/sponsored-subscriptions/slots/${giftCode}`})
        .then(response => {
          Event.send("wk-event-get-sponsored-subscription-by-gift-code", response);
          return response;
        }).catch(e => {
          Event.send("wk-event-get-sponsored-subscription-by-gift-code", e.response);
          return Promise.reject(e.response);
        })
  }

  activateSponsoredSubscription(giftCode) {
    if (!giftCode) {
      throw new Error('No gift code passed as argument');
    }

    return this.client.put(
        {
          path: `/recipient/sponsored-subscriptions/slots/activate`,
          data: {activation_code: giftCode}
        })
        .then(response => {
          Event.send("wk-event-activate-sponsored-subscription", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-activate-sponsored-subscription", e.response);
          return Promise.reject(e.response);
        })
  }

  changeSponsoredSubscriptionSettings(sponsoredSubscriptionId, settings = {}) {
    if (typeof sponsoredSubscriptionId !== "number") {
      throw new Error('No subscription id provided!');
    }

    if (typeof settings !== "object") {
      throw new Error('No settings provided!');
    }

    return this.client.put(
        {
          path: `/sponsor/sponsored-subscriptions/${sponsoredSubscriptionId}`,
          data: settings
        })
        .then(response => {
          Event.send("wk-event-change-sponsored-subscription-settings", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-change-sponsored-subscription-settings", e.response);
          return Promise.reject(e.response);
        })

  }

  clearSponsoredSubscriptionSlot(slotId) {
    if (!slotId) {
      throw new Error('No slot id passed as argument');
    }

    return this.client.put(
        {
          path: `/sponsor/sponsored-subscriptions/slots/${slotId}/clear`
        })
        .then(response => {
          Event.send("wk-event-clear-sponsored-subscription-slot", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-clear-sponsored-subscription-slot", e.response);
          return Promise.reject(e.response);
        })
  }

  turnOffPayingBySponsorForGiftSubscription(slotId) {
    if (!slotId) {
      throw new Error('No slot id passed as argument');
    }

    return this.client.put(
        {
          path: `/recipient/sponsored-subscriptions/slots/${slotId}//sponsor/turn-off`
        })
        .then(response => {
          Event.send("wk-event-turn-off-paying-by-sponsor-for-gift-subscription", response);
          return response;
        })
        .catch(e => {
          Event.send("wk-event-turn-off-paying-by-sponsor-for-gift-subscription", e.response);
          return Promise.reject(e.response);
        })
  }

}

let instance = new Wallkit();

/**
 * @ignore
 */
export default instance;
