let oldArrayProto = Array.prototype;

export let arrayMethods = Object.create(oldArrayProto);

let methods = ["pop", "unshift", "shift", "splice", "reverse", "sort", "push"];

methods.forEach((key) => {
  arrayMethods[key] = function (...args) {
    const ob = this.__ob__;
    let res;
    switch (key) {
      case "push":
      case "unshift":
        res = args;
        break;
      case "splice":
        res = args.slice(2);
        break;
      default:
        break;
    }
    if (res) {
      ob.observeArray(res);
    }
    ob.dep.notify();
    return oldArrayProto[key].apply(this, args);
  };
});
