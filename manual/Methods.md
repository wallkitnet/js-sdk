# Methods

Here you can see method list with examples.

For detailed information about methods see [Reference](../identifiers.html).

## All methods

  - [Wallkit](#wallkit)
    - [Wallkit.init](#wallkitinit)
    - [Wallkit.login](#wallkitlogin)
    - [Wallkit.logout](#wallkitlogout)
    - [Wallkit.registration](#wallkitregistration)
    - [Wallkit.checkAuth](#wallkitcheckauth)
    - [Wallkit.isAuthenticated](#wallkitisauthenticated)
    - [Wallkit.setToken](#wallkitsettoken)
    - [Wallkit.getToken](#wallkitgettoken)
    - [Wallkit.getResource](#wallkitgetresource)
    - [Wallkit.getResources](#wallkitgetresources)
    - [Wallkit.passwordReset](#wallkitpasswordreset)
    - [Wallkit.getSubscriptions](#wallkitgetsubscriptions)
    - [Wallkit.calculatePrice](#wallkitcalculateprice)
    - [Wallkit.checkOut](#wallkitcheckout)
    - [Wallkit.validatePromo](#wallkitvalidatepromo)
    - [Wallkit.getTransaction](#wallkitgettransaction)
    - [Wallkit.updateUser](#wallkitupdateuser)
    - [Wallkit.refreshToken](#wallkitrefreshtoken)
    - [Wallkit.updatePassword](#wallkitupdatepassword)
    - [Wallkit.updateEmail](#wallkitupdateemail)
    - [Wallkit.suspendMe](#wallkitsuspendme)
    - [Wallkit.confirmPassword](#wallkitconfirmpassword)
    - [Wallkit.resendEmailConfirmation](#wallkitresendemailconfirmation)
    - [Wallkit.confirmEmail](#wallkitconfirmemail)
    - [Wallkit.removeCard](#wallkitremovecard)
    - [Wallkit.getCards](#wallkitgetcards)
    - [Wallkit.defaultCard](#wallkitdefaultcard)
    - [Wallkit.getCountries](#wallkitgetcountries)
    - [Wallkit.validateInvite](#wallkitvalidateinvite)
    - [Wallkit.activateInvite](#wallkitactivateinvite)
    - [Wallkit.createStripeByToken](#wallkitcreatestripebytoken)
    - [Wallkit.sendPageView](#wallkitsendpageview)
  - [Wallkit.client](#wallkitclient)
    - [Wallkit.client.get](#wallkitclientget)
    - [Wallkit.client.post](#wallkitclientpost)
    - [Wallkit.client.put](#wallkitclientput)
    - [Wallkit.client.del](#wallkitclientdel)
    - [Wallkit.client.postForm](#wallkitclientpostform)
  - [Wallkit.user](#wallkituser)
     - [Wallkit.user.isConfirmed](#wallkituserisconfirmed)
     - [Wallkit.user.plans](#wallkituserplans)
     - [Wallkit.user.hasPlan](#wallkituserhasplan)
 
## Wallkit

Global Wallkit SDK methods.

### Walkit.init

Initializes Wallkit SDK Method.

[See how to configure it.](Config.html) 

```js
Wallkit.init();
```

**Example**

```javascript
Wallkit.init({
    resource: "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx"
});
```

### Wallkit.login

Logging user into Wallkit. After successful authorization, method initializes token & user instances. Returns Promise with received user object.

```javascript
Wallkit.login(data);
```

**Example**
```javascript
const user = {
  email: 'email@mail.com',
  password: '12345'
}

Wallkit.login(user)
       .then((user) => {
          console.log('USER:' user);
       }, (error) => {
          console.log('ERROR:', error);
       });
```

### Wallkit.logout

Logs out user from Wallkit. After successful response, method removes token & user instances.  Removes cookies & localstorage datas.

```javascript
Wallkit.logut();
```

**Example**
```javascript
Wallkit.logout()
        .then(() => {
          alert('User has logged');
        }, (error) => {
          console.log('ERROR:', error);
        });
```

### Wallkit.registration

Registers user in Wallkit. After successful authorization, method initializes token & user instances. Returns Promise with received user object. 

```javascript
Wallkit.registration(data);
```

**Data example** 
```json
{
  "email": "string",
  "password": "string",
  "password_confirm": "string",
  "first_name": "string",
  "last_name": "string",
  "company": "string",
  "job": "string",
  "zip": "string",
  "phone": "string",
  "country": "string",
  "state": "string",
  "city": "string",
  "ip": "string",
  "invite": "string",
  "extra": {}
}
```

**Example**
```js
Wallkit.registration(user)
       .then((user) => {
          console.log('USER:', user);
       }, (error) => {
          console.log('ERROR:', error);
       });
```

### Wallkit.checkAuth

Initializes user by defined token. After successful response, method initializes user instance. Returns Promise with received user object.  

```javascript
Wallkit.checkAuth();
```
**Example**
```javascript
const token = 'f96b2464-1ec2-4a1b-8c83-1b3aadb1fbb6';

Wallkit.setToken(token);

Wallkit.checkAuth()
        .then((user) => {
           console.log('USER:', user);
        }, (error) => {
           console.log('ERROR:', error);
        });
```

### Wallkit.getUser

Retrieve user information from api server. 
User data automatic stored in LocalStorage and available from object in Wallkit.user

```javascript
Wallkit.getUser();
```
**Example**
```javascript

Wallkit.getUser()
        .then((user) => {
           console.log('USER:', user);
        }, (error) => {
           console.log('ERROR:', error);
        });
```


### Wallkit.isAuthenticated

Checks user authentication status.

```javascript
Wallkit.isAuthenticated();
```

### Wallkit.setToken

Sets user token.

```javascript
Wallkit.setToken(token);
```

**Example**
```javascript
const token = 'f96b2464-1ec2-4a1b-8c83-1b3aadb1fbb6';

Wallkit.setToken(token);
```

### Wallkit.getToken

Returns token object, where value is token.

```javascript
Wallkit.getToken(); // {value: 'f96b2464-1ec2-4a1b-8c83-1b3aadb1fbb6' }
```

### Wallkit.getResource

Gets Wallkit's client resource such as `public_key`, `origin`, `payments_in_live_mode`, `stripe_public_key`. 

Returns promise with resource object.

Data automatic stored in LocalStorage and available from object in Wallkit.resource.

```javascript
Wallkit.getResource();
```

### Wallkit.getResources

Returns promise with resources object which includes resources array.

```javascript
Wallkit.getResources();
```

### Wallkit.passwordReset

Reset password by user email. Returns promise with result.

```javascript
Wallkit.passwordReset(object|string);
```

**Example**
```javascript
Wallkit.passwordReset('test@mail.com')
        .then((response) => {
            if (response.result) {
                alert('Your password reset.')
            } else {
                alert('Your password not reset.')
            }
        }).catch((error) => {
            alert(error);
        });
```

### Wallkit.getSubscriptions

Gets available subscriptions for payment. 

Returns promise with includes array with subscriptions.

```javascript
Wallkit.getSubscriptions();
```

### Wallkit.calculatePrice

Request for calculate final price with discount. 

Before buying, it is advisable to make a recalculation, that would show the price, taking into account the discount, and the full purchase price. Also check the ability to make a purchase by the user.

Returns promise with price calculation info.

```javascript
Wallkit.calculatePrice(Array);
```

**Data example**
```json
[
  {
    "item_type": "string",
    "item_key": "string",
    "user_card_id": 0,
    "item_resource": "string",
    "promo": "string"
  }
]
```

**Response example**
```json
{
  "total_price": 0,
  "discount": 0,
  "discounted_total_price": 0,
  "currency": "string",
  "purchases": [
    {
      "item_type": "string",
      "item_key": "string",
      "promo": "string",
      "price": 0,
      "discount": 0,
      "discounted_price": 0,
      "currency": "string"
    }
  ]
}
```

### Wallkit.checkOut

The process of buying users of one or more content, bundle or subscription

Returns promise with transactions info.

```javascript
Wallkit.checkOut(Array);
```

**Data example**
```json
[
  {
    "item_type": "string",
    "item_key": "string",
    "user_card_id": 0,
    "item_resource": "string",
    "promo": "string"
  }
]
```

### Wallkit.validatePromo

Before buying, a promo code must (optional) be validated. 

Returns promise with validation info.

```javascript
Wallkit.validatePromo(string | object);
```

### Wallkit.getTransaction

Gets transaction by id.

Returns promise with transaction info.

```javascript
Wallkit.getTransaction(number);
```

### Wallkit.updateUser

Updates user's info.

Returns promise with user updated info.

```javascript
Wallkit.updateUser(object);
```

**Data Example**
```json
{
  "first_name": "string",
  "last_name": "string",
  "job": "string",
  "zip": "string",
  "phone": "string",
  "country": "string",
  "state": "string",
  "city": "string",
  "company": "string",
  "extra": {}
}
```

### Wallkit.refreshToken

Refresh token by refresh code.

Returns promise with token info.

```javascript
Wallkit.refreshToken(string | object);
```

**Data Example**
```json
{
  "first_name": "string",
  "last_name": "string",
  "job": "string",
  "zip": "string",
  "phone": "string",
  "country": "string",
  "state": "string",
  "city": "string",
  "company": "string",
  "extra": {}
}
```

### Wallkit.updatePassword

Updates user's password.

Returns promise with success info.

```javascript
Wallkit.updatePassword(object);
```

**Data Example**
```json
{
  "password": "string",
  "password_confirm": "string"
}
```

### Wallkit.updateEmail

Updates user's email.

Returns promise with success info.

```javascript
Wallkit.updateEmail(string|object);
```

**Object Data Example**
```json
{
  "email": "test@mail.com",
}
```

### Wallkit.suspendMe

Suspends user from all resources, auto-renew will be suspended. The user will not be able to log in.

Returns promise with user info.

```javascript
Wallkit.suspendMe();
```

### Wallkit.confirmPassword

Confirms user reset password by code. Also sets new token & inits user.

Returns promise with user info.

```javascript
Wallkit.confirmPassword(string|object);
```

### Wallkit.resendEmailConfirmation

Resends user confirmation email.

If the user did not receive the letter after registration, and the mail is not confirmed, you can request a new email with a confirmation code.
Please configure event “Resend Confirmation” to send the respective email.

Returns promise with result status.

```javascript
Wallkit.resendEmailConfirmation();
```

### Wallkit.confirmEmail

Confirms email by activation code.
 
Returns promise with result status.

```javascript
Wallkit.confirmEmail(string|object);
```

### Wallkit.removeCard

Deletes a user card. A user may have several cards, and there must be a default card. If a card is deleted by default, its nearest card becomes the default card.
 
Returns promise with result status.

```javascript
Wallkit.removeCard(number);
```

### Wallkit.getCards

Gets user's card list.
 
Returns promise with response object which includes cards array(items) and pagination object.

```javascript
Wallkit.getCards();
```

**Response Example**
```json
{
  "paginator": {
    "current_page": 0,
    "last_page": 0,
    "total_pages": 0,
    "total_items": 0,
    "limit": 0
  },
  "items": [
    {
      "id": 0,
      "card_brand": "string",
      "card_country": "string",
      "card_last4": "string",
      "pay_system": "string",
      "default": true,
      "expiration_date": "string",
      "created_at": "string"
    }
  ]
}
```

### Wallkit.defaultCard

Sets user default card by card id.

Returns promise with result status.

```javascript
Wallkit.defaultCard(number);
```

### Wallkit.getCountries

For ease of registration or other forms, you can use the list of all countries, if the request is un, then the user’s country will be marked as “selected”.

Returns promise with result status.

```javascript
Wallkit.getCountries();
```

**Response Example**
```json
{
  "items": [
    {
      "title": "string",
      "code": "string",
      "sort": 0,
      "selected": true,
      "states": [
        {
          "title": "string",
          "code": "string"
        }
      ]
    }
  ]
}
```

### Wallkit.getCurrencies

Gets list of supported currencies.

Returns promise with currencies list.

```javascript
Wallkit.getCurrencies();
```

**Response Example**
```json
{
  "items": [
    {
      "title": "string"
    }
  ]
}
```

### Wallkit.validateInvite

Validates invite by invite code.

Returns promise with result status.

```javascript
Wallkit.validateInvite(string | object);
```

### Wallkit.activateInvite

Activates invite for an authorized user by invite code.

Returns promise with result status.

```javascript
Wallkit.activateInvite(string | object);
```

### Wallkit.createStripeByToken

If you use Stripe.js (or other stripeSDK), then it returns the token that needs to be passed to this request. Then the card will be added to the user and will become by default.

Returns promise with result status.

```javascript
Wallkit.activateInvite(string | object);
```

### Wallkit.sendPageView

Method pushes 'page view' event to analytic.

Returns promise with result status.

```javascript
Wallkit.sendPageView(string, string);
```

**Example**
```javascript
Wallkit.sendPageView("/content/post-123456789", "123456789")
  .then(response => {
    console.log('response:', response);
  })
  .catch(e => console.log('error:', e));
```
or
```javascript
Wallkit.sendPageView({
     "name": "page_view",
     "value": "/content/post-123456789",
     "content_key": "123456789" 
    })
    .then(response => {
      console.log('response:', response);
    })
    .catch(e => console.log('error:', e));
```


## Wallkit.client

Methods list to communicate with API.
[See Wallkit API Documentation](http://wallkit.net/docs).

### Wallkit.client.get

GET request to manipulate Wallkit API.

```javascript
Wallkit.client.get({path, data});
```

**Example**
```javascript
Wallkit.client.get({
    path: "/user/cards"
}).then(response => {
    console.log('response:', response);
}).catch(e => console.log('error:', e));
```

### WallkitClient.post
POST request to manipulate Wallkit API.

```javascript
Wallkit.client.post({path, data});
```
**Example**
```javascript
Wallkit.client.post({
    path: "/invite-validation",
    data: {
        invite: 'yummy',
        return_invite: true
    }
}).then(response => {
    console.log('response:', response);
}).catch(e => console.log('error:', e));
```

### WallkitClient.put
PUT request to manipulate Wallkit API.

```javascript
Wallkit.client.put({path, data});
```

**Example**
```javascript
Wallkit.client.put({
    path: "/user/email",
    body: {
      email: "test@email.com"
    }
}).then(response => {
    console.log('response:', response);
}).catch(e => console.log('error:', e));
```

### Wallkit.client.del
DELETE request to manipulate Wallkit API.

```javascript
Wallkit.client.del({path, data});
```

**Example**
```javascript
Wallkit.client.del({
    path: "/user/teams/35",
    data: {
      id: 35
    }
}).then(response => {
    console.log('response:', response);
}).catch(e => console.log('error:', e));
```

### Wallkit.client.postForm
POST request with form data to manipulate Wallkit API.

```javascript
Wallkit.client.postForm({path, data});
```

**Example**
```javascript
const userData = {
   name: "Volodimir",
   description: "Volidimir Giant",
   member_limit: 3
}

Wallkit.client.postForm({
    path: "/registration",
    data: {
      id: 35
    }
}).then(response => {
    console.log('response:', response);
}).catch(e => console.log('error:', e));
```


## Wallkit.user


### Wallkit.user
Get current user from localStorage

```js
Wallkit.user;
```

**Return value example**
```js
{
  "id":xxxx,
  "email":"xxxxxxxxx@xxxx.com",
  "first_name":"xxx",
  "last_name":"xxx",
  "active":true,
  "confirm":true,
  "country":"xxx",
  "city":"xxx",
  "state":"",
  "company":"xxx",
  "job":"xxx",
  "zip":null,
  "created_at":"xxx",
  ...
}
```

### Wallkit.user.isConfirmed
Checks is user has confirmed his email.

```js
Wallkit.user.isConfirmed();
```


### Wallkit.user.plans
Gets user's plans list.

```js
Wallkit.user.plans();
```

**Return value example**
```js
[{
    can_own_teams: true,
    full_access: true,
    priority: 400,
    slug: "premium",
    title: "Premium"
 }, {
    can_own_teams: false,
    full_access: false,
    priority: 300,
    slug: "premium",
    title: "Premium"
}]
```

### WallkitUser.hasPlan
Checks if user is subscribed to the plan.

```js
Wallkit.user.hasPlan(plan);
```

Plan data example:
```js
{
  can_own_teams: true,
  full_access: true,
  priority: 400,
  slug: "premium",
  title: "Premium"
}
```
