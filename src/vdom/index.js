//h() _c()
// _c('div',{},...children)
export function createElementVNode(vm, tag, data = {}, ...children) {
  data = data ?? {};
  let key = data.key;
  if (key) {
    delete data.key;
  }
  return vnode(vm, tag, key, data, children);
}

// _v('text')
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

//ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身
// 虚拟dom描述的是dom元素,可以增加一些自定义属性
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
  };
}
