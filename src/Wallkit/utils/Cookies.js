/*\
 |*|
 |*|	:: cookies.js ::
 |*|
 |*|	A complete cookies reader/writer framework with full unicode support.
 |*|
 |*|	Revision #1 - September 4, 2014a
 |*|
 |*|	https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
 |*|	https://developer.mozilla.org/User:fusionchess
 |*|	https://github.com/madmurphy/cookies.js
 |*|
 |*|	This framework is released under the GNU Public License, version 3 or later.
 |*|	http://www.gnu.org/licenses/gpl-3.0-standalone.html
 |*|
 |*|	Syntaxes:
 |*|
 |*|	* docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|	* docCookies.getItem(name)
 |*|	* docCookies.removeItem(name[, path[, domain]])
 |*|	* docCookies.hasItem(name)
 |*|	* docCookies.keys()
 |*|
 \*/

import Config from "../Config";
import { getDomainWithoutSubdomain } from "./Location";

/**
    @ignore
 */
var docCookies = {
    getItem: function (sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        if (!sKey) { return false; }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    },
    cookieDomain: function () {
      return Config.subDomainCookie ? `.${getDomainWithoutSubdomain(window.location)}` : '';
    }
};

if(typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = docCookies;
}

export default docCookies;
