// import Wallkit from '../dist/wallkit.umd.min';
import Wallkit from './Wallkit';
import Cookies from './Wallkit/utils/Cookies';
import Config from './Wallkit/Config'
import Client from './Wallkit/WallkitClient';

window.onload = function () {

    Wallkit.init({
        resource: "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx"
    });


    let email = 'dev@wallkit.net';
    let password = '**********';

    Wallkit.login({email, password})
        .then((user) => {
                console.log("after login", user);
                Wallkit.checkAuth().then(user => {
                    console.log("after checkAuth", user);
                }).catch(error => {
                    console.log(error);
                });
            },
            (error) => {
                console.log('error:', error);
            });


    Client.post({
        path: "/invite-validation",
        data: {
            invite: 'yummy',
            return_invite: true
        }
    }).then(response => {
        console.log('response:', response);
    }).catch(e => console.log('error:', e));

};