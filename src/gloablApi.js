import { mergeOptions } from "./utils";

export function initGlobalApi(Vue) {
  Vue.options = {
    _base: Vue,
  };
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };

  Vue.extend = function (options) {
    function Sub(options = {}) {
      this._init(options);
    } //使用一个组件就是new 一个实例
    Sub.prototype = Object.create(Vue.prototype);
    Sub.prototype.constructor = Sub;
    Sub.options = mergeOptions(Vue.options, options); //所有子组件都是走的这个，所以如果data是一个对象而不是一个函数的话就会导致引用重复问题，然后导致多个子组件共用同一个对象空间，造成错误
    return Sub;
  };
  Vue.options.components = {};
  Vue.component = function (id, definition) {
    if (typeof definition !== "function") {
      Vue.extend(definition);
    }
    Vue.options.components[id] = definition;
  };
}
