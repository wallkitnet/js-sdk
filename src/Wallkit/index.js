import Wallkit from './Wallkit';

export default Wallkit;

export WallkitUser from './WallkitUser';
export WallkitClient from './WallkitClient';
export Config from './Config';
export WallkitToken from './WallkitToken';
export WallkitFirebase from './WallkitFirebase';

if (typeof window != undefined && !window.Wallkit) {
    window.Wallkit = Wallkit;
}