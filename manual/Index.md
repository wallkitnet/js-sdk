![logo](https://wallkit.net/wallkit/images/wallkit-logo.svg "Wallkit")

# Usage

 - [Installation](#installation)
 - [Initialization](#initialization)
 - [What next?](#what-next-)
 
 
## Installation

1. Download Wallkit SDK from https://wallkit.net/

2. Include Wallkit SDK To Website/App  

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

## Initialization

 To start using Wallkit SDK, use [Wallkit.init()](class/Wallkit/Wallkit.js~Wallkit.html#instance-method-init) method, with [config](./manual/Config.html).
 
 ```js
// Example
Wallkit.init({
    resource: "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx"
});
```

## What next?

As you see it is really easy to integrate Wallkit SDK into your website or app. So here are your next steps:

 - Go to [Documentation](./manual/Methods.html) or [Reference](identifiers.html) to learn more about Wallkit SDK and how to use it.
 - If you have questions about Wallkit SDK don't hesitate to ask them to our [Wallkit Team.](http://wallkit.net)    