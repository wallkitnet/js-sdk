import 'whatwg-fetch';
import Config from './Config'
import Wallkit  from './Wallkit';
import {assign, keysIn} from 'lodash';
import Promise from 'bluebird';

/**
 * @desc Class to manipulate with Wallkit API.
 * @public
 */
class WallkitClient {
    /**
     * Wallkit Client constructor. Accepts nothing.
     */
    constructor() {
    }

    /**
     * Gets token.
     * @private
     * @return {String}
     */
    get token() {
        return (Wallkit.token || {}).value;
    }

    /**
     * Gets Wallkit Config resource.
     * @public
     * @return {String}
     */
    get resource () {
        return Config.resource;
    }

    /**
     * Gets Wallkit Host based on provided config.
     * @public
     * @return {String}
     */
    get host() {
        //return `https://${Config.host}/api/${Config.version}`;
      return Config.api_url;
    }

    /**
     * Method makes GET request to manipulate with Wallkit API.
     * API Documentation at https://wallkit.net/docs
     *
     * @public
     * @param {Object} data
     * @property {String} path - request path
     * @property {Object} params - request data
     * @return {Promise} returns promise
     *
     * @example
     * #Example 1
     * WallkitClient.get({
     *   path: "/user/cards",
     *   params: {
     *       resource: "subscription",
     *       token: "6fc5705264be925cb1b53d16631a8f55e195793d"
     *   }
     * }).then(response => {
     *     console.log('response:', response);
     * }).catch(e => console.log('error:', e));
     */
    get({path,params}) {
        return this.makeRequest({path,params})
    }

    /**
     * Method makes POST request to manipulate with Wallkit API.
     * API Documentation at https://wallkit.net/docs
     *
     * @public
     * @param {Object} data
     * @property {String} path - request path
     * @property {Object} data - request data
     * @return {Promise} returns promise
     *
     * @example
     * #Example 1
     * WallkitClient.post({
     *  path: "/invite-validation",
     *  data: {
     *       invite: 'yummy',
     *       return_invite: true
     *   }
     * }).then(response => {
     *     console.log('response:', response);
     * }).catch(e => console.log('error:', e));
     */
    post({path,data}) {
        return this.makeRequest({
            path,
            method:'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    /**
     * Method makes native-post request to manipulate with Wallkit API.
     * API Documentation at https://wallkit.net/docs
     *
     * @public
     * @return {Promise} returns promise
     *
     * @example
     * #Example 1
     * WallkitClient.get({
     *   path: "/user/cards",
     *   data: {
     *       resource: "subscription",
     *       token: "6fc5705264be925cb1b53d16631a8f55e195793d"
     *   }
     * }).then(response => {
     *     console.log('response:', response);
     * }).catch(e => console.log('error:', e));
     */
    nativePost({path,data}) {
        return this.makeNativeRequest({
            path,
            method:'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    /**
     * Method makes Post request with Form Data.
     * API Documentation at https://wallkit.net/docs
     *
     * @public
     * @return {Promise} returns promise
     *
     * @example
     * WallkitClient.get({
     *       path: "/user/cards"
     *   }).then(response => {
     *       console.log('response:', response);
     *   }).catch(e => console.log('error:', e));
     */
    postForm({path,data}) {
        let formData = new FormData();

        try {
            Object.keys(data).forEach(key => {
            formData.append(key,data[key])
          });
        } catch (err) {
            console.log('post form error', err);
        }

        return this.makeRequest({
            path,
            method:'POST',
            body: formData,
            headers: {}
        })
    }

    /**
     * Method makes PUT request to manipulate with Wallkit API.
     * API Documentation at https://wallkit.net/docs
     *
     * @public
     * @return {Promise} returns promise
     *
     * @example
     * #Example 2
     * WallkitClient.put({
     *       path: "/user/email",
     *       body: {
     *         email: "test@email.com"
     *       }
     *   }).then(response => {
     *       console.log('response:', response);
     *   }).catch(e => console.log('error:', e));
     */
    put({path, data}) {
        return this.makeRequest({
            path,
            method:'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    /**
     * Method makes DELETE request to manipulate with Wallkit API.
     * API Documentation at https://wallkit.net/docs
     *
     * @public
     * @param {String} path - request path
     * @return {Promise} returns promise
     *
     * @example
     * WallkitClient.del({
     *       path: "/user/teams/35",
     *       data: {
     *         id: 35
     *       }
     *   }).then(response => {
     *       console.log('response:', response);
     *   }).catch(e => console.log('error:', e));
     */
    del({path}) {
        return this.makeRequest({
            path,
            method:'DELETE'
        })
    }

    /**
     * Method wrapper for request to manipulate with Wallkit API.
     *
     * @private
     * @return {Promise} returns promise
     *
     * @ignore
     */
    makeNativeRequest({path,method = 'GET',headers = {},body = {}}) {
        function checkStatus(response) {
            if (response.status >= 200 && response.status < 300) {
                return response.json()
            } else {
                    let promise = new Promise((resolve, reject) => {
                        resolve(response.json());
                    });

                    return promise.then((json) => {
                        let error = new Error(response.statusText);
                        error.response = json;
                        throw error
                    });

                    // return Promise.resolve(response.json())
                    //     .then((json) => {
                    //         let error = new Error(response.statusText);
                    //         error.response = json;
                    //         throw error
                    //     })

                // return Promise.resolve(response.json())
                //     .then((json) => {
                //         let error = new Error(response.statusText);
                //         error.response = json;
                //         throw error
                //     })
            }
        }

        assign(headers,{'resource': this.resource});
        assign(headers,{'Wallkit-Client': 'JsSDK v1.1.1'});

        if (this.token)
            assign(headers,{'token': this.token});

        let request = {
            method,
            headers
        };

        try {
            if (keysIn(body).length > 0 || body instanceof FormData) {
                assign(request,{'body': body});
            }

        } catch(err) {
            console.log('make request error', err);
        }
        return fetch(`${this.host}${path}`, request).then(checkStatus)
    }

    /**
     * Method wrapper for request to manipulate with Wallkit API.
     *
     * @private
     * @return {Promise} returns promise
     *
     * @ignore
     */
    makeRequest({path,method = 'GET',headers = {},body = {}}) {

      function checkStatus(response)
      {


          if (response.status >= 200 && response.status < 300) {
              return response.json()
          }
          else
          {
              /*let promise = new Promise((resolve, reject) => {
                  resolve(response.json());
              });*/

             /* return promise.then((json) => {
                  let error = new Error(response.statusText);
                  error.response = json;
                  throw error
              }).catch(e => {
                  console.log('error', e)
              })*/

               return Promise.resolve(response.json())
                   .then((json) => {

                      let error = {};

                      if(typeof json.error_description !== "undefined")
                      {
                        error = new Error(json.error_description);
                      }
                      else
                      {
                        error = new Error(response.statusText);
                      }

                       error.statusText = response.statusText;
                       error.statusCode = response.status;
                       error.requestUrl = response.url;
                       error.response = json;
                       throw error
                   })


          }
      }



        assign(headers,{'resource': this.resource});
        assign(headers,{'Wallkit-Client': 'JsSDK v1.1.1'});

        if (this.token)
            assign(headers,{'token': this.token});

        let request = {
            method,
            headers
        };

        try {
          // if(Object.keys(body).length > 0 || body instanceof FormData){
          //   assign(request,{'body': body});
          // }

          if (keysIn(body).length > 0 || body instanceof FormData) {
            assign(request,{'body': body});
          }

        } catch(err) {
            console.log('make request error', err);
        }

        // return fetch(new URL(`${this.host}${path}`),request).then(checkStatus)
        return fetch(`${this.host}${path}`, request).then(checkStatus)
    }
}

let client = new WallkitClient();

/**
 * @ignore
 */
export default client;