import { compileToFunction } from "./compiler";
import { initState } from "./state";
import { callHook, mountComponent } from "./lifecycle";
import { mergeOptions } from "./utils";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    //我们定义的全局指令和过滤器。。。。都会挂载到实例上
    this.$options = mergeOptions(this.constructor.options, options);
    callHook(this, "beforeCreate");
    //初始化状态
    initState(this);
    callHook(this, "created");

    if (options.el) {
      this.$mount(options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    el = document.querySelector(el);
    let vm = this;
    let ops = vm.$options;
    if (!ops.render) {
      let template = ops.template;
      if (!template && el) {
        template = el.outerHTML;
      }
      if (template) {
        let render = compileToFunction(template);
        ops.render = render;
      }
    }
    // console.log(ops.render, "render");
    mountComponent(vm, el);
  };
}
