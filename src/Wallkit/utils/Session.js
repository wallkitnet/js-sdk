import LocalStorage from './LocalStorage';
import Cookies from './Cookies';
import Resource from './Resource';

const session_slug = 'wk-session';

let Session = {
  getSessionKey: (resource) => {
    if (resource) {
      return Resource.formatKey(session_slug, resource);
    }

    return session_slug;
  },
  getSession: (resource) => {
    return LocalStorage.getItem(Session.getSessionKey(resource)) || Cookies.getItem(Session.getSessionKey(resource));
  },
  setSession: (newSession, resource) => {
    LocalStorage.setItem(Session.getSessionKey(resource), newSession);
    Cookies.setItem(Session.getSessionKey(resource), newSession,  Infinity, '/');
  },
  removeSession: (resource) => {
    Cookies.removeItem(Session.getSessionKey(resource), '/');
    LocalStorage.removeItem(Session.getSessionKey(resource));
  }
};

export default Session;