import { isSameVnode } from ".";

function createComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode);
  }
  if (vnode.componentInstance) {
    return true;
  }
}
export function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    //创建元素，也要区分是组件还是元素
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }

    vnode.el = document.createElement(tag);

    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

export function patchProps(el, oldProps = {}, props = {}) {
  //老的属性有,新的没有,删除
  let oldStyle = oldProps.style || {};
  let newStyle = props.style || {};

  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }

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

export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    return createElm(vnode);
  }

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
    //1.两个节点不是同一个节点,直接删除老的节点，直接使用新的节点
    //2.两个节点是同一个节点(判断节点的tag和节点的key属性)，比较节点的属性是否有差异(复用老的节点,将差异属性更新
    //3.节点比较完成就要比较子节点了
    return patchVnode(oldVnode, vnode);
  }
}
function patchVnode(oldVnode, vnode) {
  if (!isSameVnode(oldVnode, vnode)) {
    const el = createElm(vnode);
    oldVnode.el.parentNode.replaceChild(el, oldVnode.el);
    return el;
  }

  //文本情况,文本期望比较一下文本的内容
  let el = (vnode.el = oldVnode.el);
  if (!oldVnode.tag) {
    if (oldVnode.text !== vnode.text) {
      el.textContent = vnode.text;
    }
  }

  //标签,标签的更新
  patchProps(el, oldVnode.data, vnode.data);

  let oldChildren = oldVnode.children || [];
  let newChildren = vnode.children || [];
  if (oldChildren.length > 0 && newChildren.length > 0) {
    //都有子节点
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    //新的有子节点,老的没有子节点
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0) {
    el.innerHTML = ""; //可以循环删除
  }

  return el;
}
function mountChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    el.appendChild(createElm(child));
  }
}

function updateChildren(el, oldChildren, newChildren) {
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[oldStartIndex];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];
  let newStartIndex = 0;
  let newStartVnode = newChildren[newStartIndex];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map;
  }

  let map = makeIndexByKey(oldChildren);

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 头头比较
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 尾尾比较
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    // 交叉对比 abcd -> dabc
    else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      //在给动态列表添加key的时候，要尽量避免使用索引，因为索引可能会变化，可能会发生错误复用

      //乱序对比
      // 根据老的列表做一个映射关系，用新的去找，找到就移动，找不到就添加，最后多余的删除
      let moveIndex = map[newStartVnode.key];
      if (moveIndex !== undefined) {
        let moveVNode = oldChildren[moveIndex];
        patchVnode(moveVNode, newStartVnode);
        el.insertBefore(moveVNode.el, oldStartVnode.el);
        oldChildren[moveIndex] = null;
      } else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const child = createElm(newChildren[i]);
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null;
      el.insertBefore(child, anchor);
      console.log(anchor);
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i] !== null) {
        const child = oldChildren[i];
        el.removeChild(child.el);
      }
    }
  }
}
