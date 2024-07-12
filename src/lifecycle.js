import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";

function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);

    patchProps(vnode.el, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, props) {
  for (let key in props) {
    if (key === "style") {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patch(oldVnode, vnode) {
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    const elm = oldVnode;
    const parentElm = elm.parentNode;
    const newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibling);
    parentElm.removeChild(elm);
    return newElm;
  } else {
    //diff算法
  }
}

export function initLifecycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // console.log("_upload", vnode);
    const vm = this;
    const el = vm.$el;
    vm.$el = patch(el, vnode);
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
