import LocalStorage from './LocalStorage';
import Cookies from './Cookies';

let session_slug = 'wk-session';

let Session = {
  removeSession: () => {
    Cookies.removeItem(session_slug, '/');
    LocalStorage.removeItem(session_slug);
  }
};

export default Session;