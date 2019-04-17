import _ from 'lodash';
import client from './WallkitClient';
import Event from "./utils/Events";

/**
 * Class to manipulate with User.
 */
export default class WallkitUser {
    /**
     * Constructor for WallkitUser class.
     *
     * @param {object} props - object with user information
     *
     * @example
     * let user = new WallkitUser({
     *   active: true,
     *    can_own_teams: true,
     *    city: "Odessa",
     *    company: "Grandiz",
     *    confirm: true,
     *    country: "American Samoa",
     *    created_at: "2015-12-16 12:33:18",
     *    email: "dev@grandiz.com",
     *    ...
     * })
     */
    constructor(props) {
      Object.keys(props).forEach((key) => {
        Object.defineProperty(this, key, {
          value: props[key],
          enumerable: true
        })
      });


      if (!_.isEmpty(this.token))
      {
        Event.send("wk-event-token", this.token);
      }

      Event.send("wk-event-user", this);

    }



    /**
     * Serialize user instance and insert it in localstorage
     *
     * @public
     * @return {function}
     *
     * @example
     * WallkitUser.serialize();
     */
    serialize() {
        return localStorage.setItem(WallkitUser.storageKey,JSON.stringify(this))
    }

    /**
     * Method checks is user passed confirmation.
     *
     * @public
     * @return {boolean} - confirmation state
     *
     * @example
     * WallkitUser.isConfirmed();
     */
    isConfirmed() {
        return !!this.confirm;
    }

    /**
     * Method gets user's plans list.
     *
     * @public
     * @return {array} - array with plan objects
     *
     * @example
     * WallkitUser.plans();
     */
    plans() {
        return this.subscriptions.length === 0 ? [{title:'guest'}] : this.subscriptions.map(subscription => subscription.plan);
    }

    /**
     * Method checks if User has provided plan.
     *
     * @public
     * @param {Object} plan - user's plan object
     * @return {boolean} - is plan exist in user.
     *
     * @example
     * const plan = {
     *    can_own_teams: true,
     *    full_access: true,
     *    priority: 400,
     *    slug: "premium",
     *    title: "Premium"
     * };
     *
     * WallkitUser.hasPlan(plan); //true
     */
    hasPlan(plan) {
        return this.plans().includes(plan);
    }

}

WallkitUser.storageKey = 'WallkitUser';

/**
 * Deserialize user from localStorage and creates instance of {@link WallkitUser}
 *
 * @public
 * @return {WallkitToken} - return WallkitToken instance
 *
 * @example
 * WallkitToken.deserialize();
 */
WallkitUser.deserialize = function () {

    let storedUser = JSON.parse(localStorage.getItem(WallkitUser.storageKey));

    if (storedUser && storedUser.id)
    {
      return new WallkitUser(storedUser);
    }
    return null
};

WallkitUser.reload = function () {
    return client.get({path: '/user'});
};

