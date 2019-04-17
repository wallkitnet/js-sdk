

var Events = {



  send(name, value, params)
  {

    let data = {
      name: name,
      value: value,
      params: params
    };

    /*if(_.isEqual(data, this.event_tmp))
    {
      return ;
    }*/

    //this.event_tmp = data;
    //top.postMessage(data, document.location.origin);

    top.postMessage(data, '*');

    console.log("WkJsSDK EVENT:", data);
  }


};

if(typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Events;
}