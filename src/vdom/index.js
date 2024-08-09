//h() _c()
// _c('div',{},...children)

const isReservedTag = (tag) => {
  return ["a", "p", "li", "ul", "div", "img", "span", "button"].includes(tag);
};
export function createElementVNode(vm, tag, data = {}, ...children) {
  data = data ?? {};
  let key = data.key;
  if (key) {
    delete data.key;
  }

  if (isReservedTag(tag)) {
    return vnode(vm, tag, key, data, children);
  } else {
    //创造一个组件的虚拟节点
    let Ctor = vm.$options.components[tag]; // 组件的构造函数
    return createComponentVnode(vm, tag, key, data, children, Ctor);
  }
  // return vnode(vm, tag, key, data, children);
}
function createComponentVnode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === "object") {
    Ctor = vm.$options._base.extends(Ctor);
  }
  data.hook = {
    init(vnode) {
      let instance = (vnode.componentInstance =
        new vnode.componentOptions.Ctor());
      instance.$mount();
    },
  };
  return vnode(vm, tag, key, data, children, undefined, { Ctor });
}
// _v('text')
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

//ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身
// 虚拟dom描述的是dom元素,可以增加一些自定义属性
function vnode(vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions,
  };
}

export function isSameVnode(vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}
