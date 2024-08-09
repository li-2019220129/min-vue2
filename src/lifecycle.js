import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";

export function initLifecycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // console.log("_upload", vnode);
    const vm = this;
    const el = vm.$el;
    const prevVnode = vm._vnode;
    vm._vnode = vnode;
    if (prevVnode) {
      //之前渲染过了
      vm.$el = patch(prevVnode, vnode);
    } else {
      vm.$el = patch(el, vnode);
    }
  };

  // _c('div',{},...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };

  // _v()
  Vue.prototype._v = function () {
    console.log(createTextVNode(this, ...arguments), "12122111");
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };
  Vue.prototype._render = function () {
    //当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
    let vm = this;
    return vm.$options.render.call(vm);
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;
  // 1. 调用render方法产生虚拟dom
  const uploadComponent = () => {
    vm._update(vm._render());
  };
  //数据变化重新渲染视图
  new Watcher(vm, uploadComponent, true);
  // 2. 根据虚拟dom产生真实dom
  // 3. 插入到el
}

// vue 核心流程 （1）创造了响应式数据 （2）模板转换成ast语法树
// （3）将ast 转换成渲染函数 （4）将渲染函数执行后产生虚拟dom （5）根据虚拟dom 生成真实dom

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
