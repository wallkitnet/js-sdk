import Debug from './Debug';

const Events = {
    send(name, value, params) {
        const data = {
            name: name,
            value: value,
            params: params
        };
        const frames = document.getElementsByTagName('iframe');
        if (window && top && window === top && !!frames.length) {
            for (let i = 0; i < frames.length; i++) {
                if (typeof frames[i] !== "undefined") {
                    frames[i].contentWindow.postMessage(data, '*');
                }
            }
        } else {
            top.postMessage(data, '*');
        }
        Debug.log("WkJsSDK ==>", data);
    }
};

export default Events;
