let strats = {};
const LIFECYCLE = ["beforeCreate", "created"];

LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        return p.concat(c);
      } else {
        return [c];
      }
    } else {
      return p;
    }
  };
});
strats.components = function (parentVal, childVal) {
  const res = Object.create(parentVal);
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key]; // 返回的是构造的对象，可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己的身上
    }
  }
  return res;
};

export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key];
    }
  }
  return options;
}
