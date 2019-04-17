![logo](https://wallkit.net/wallkit/images/wallkit-logo.svg "Wallkit")

## Introduction

> Welcome to Wallkit JS-SDK.

## Installation

Use the package manager [npm](https://nodejs.org/en/) to install packages.
```bash
$ npm install
$ npm run build
```

## Integration

1. Include Wallkit SDK To Website/App  

    - As HTML 
    ```html
    <script src="wallkit.umd.min.js"></script>
    ```
    
    - As UMD
    ```javascript
    require('wallkit.umd.min.js');
    ```
    
    - As ES module
    ```javascript
    import Wallkit from 'wallkit.esm.min.js';
    ```

## Usage

 To start using Wallkit SDK, use Wallkit.init() method, where resource - your Wallkit public key.
 
 ```js
// Example
Wallkit.init({
    resource: "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx"
});
```
  
## Documentation 

To generate documentation please install packages and run:

```bash
$ npm run doc
```

 - Go to [Documentation](/manual/Methods.md) to learn more about Wallkit JS-SDK and how to use it.
 - If you have questions about Wallkit SDK don't hesitate to ask them to our [Wallkit Team.](http://wallkit.net)    


