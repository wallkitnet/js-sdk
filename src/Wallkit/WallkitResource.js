import client from './WallkitClient';

/**
 * Class to manipulate with Resources.
 */
export default class WallkitResource {
    /**
     * Constructor for WallkitResource class.
     *
     * @param {object} props - object with user information
     *
     */
    constructor(props) {
      Object.keys(props).forEach((key) => {
        Object.defineProperty(this, key, {
          value: props[key],
          enumerable: true
        })
      });

    }


    /**
     * Serialize resource instance and insert it in localstorage
     *
     * @public
     * @return {function}
     *
     * @example
     * WallkitResource.serialize();
     */
    serialize() {
        return localStorage.setItem(WallkitResource.storageKey,JSON.stringify(this))
    }

}

WallkitResource.storageKey = 'WallkitResource';

/**
 * Deserialize user from localStorage and creates instance of {@link WallkitResource}
 *
 * @example
 * WallkitResource.deserialize();
 */
WallkitResource.deserialize = function () {

    let storedResource = JSON.parse(localStorage.getItem(WallkitResource.storageKey));

    if (storedResource)
    {
      return new WallkitResource(storedResource);
    }
    return null
};

WallkitResource.reload = function () {
  return client.get({path: '/resource'});
};


