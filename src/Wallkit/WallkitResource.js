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

      //console.log("resource props 2", props);

      if(typeof props.origin !== "undefined")
      {
        WallkitResource.allOrigins.push(props.origin);
      }

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

WallkitResource.allOrigins =  [
  'http://127.0.0.1:8000',
  'https://wallkit.net',
  'https://dev.wallkit.net',
  'https://wallkit.local',
];

WallkitResource.hasOrigin = function (key) {
  //console.log("check has origin 2", key, WallkitResource.allOrigins);
  return (WallkitResource.allOrigins.indexOf(key) >= 0)
};

WallkitResource.getOrigins = function () {
  return WallkitResource.allOrigins;
};

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


