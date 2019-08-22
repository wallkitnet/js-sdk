
var Events = {


  send(name, value, params)
  {

    let data = {
      name: name,
      value: value,
      params: params
    };

    let frames = document.getElementsByTagName('iframe');

    if(window && top && window === top && !!frames.length)
    {
      for (let i = 0; i < frames.length; i++) {

        if(typeof frames[i] !== "undefined")
        {
          frames[i].contentWindow.postMessage(data, '*');
        }
      }

    }
    else
    {
      top.postMessage(data, '*');
    }

    console.log("WkJsSDK ==>", data);
  }

};

if(typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Events;
}
