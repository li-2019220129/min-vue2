import { arrayMethods } from "./array";
import Dep from "./dep";
class Observer {
  constructor(data) {
    // 给每个对象和数组都增加收集功能
    this.dep = new Dep(); //$set做准备

    Object.defineProperty(data, "__ob__", {
      enumerable: false,
      value: this,
    });
    if (Array.isArray(data)) {
      //重写数组方法，这样数据变化就可以监控到
      Object.setPrototypeOf(data, arrayMethods);
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  observeArray(data) {
    for (let i = 0; i < data.length; i++) {
      observe(data[i]);
    }
  }
  walk(data) {
    Object.keys(data).forEach((item) => {
      defineReactive(data, item, data[item]);
    });
  }
}

function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}
export function defineReactive(obj, key, val) {
  let childOb = observe(val); // 递归对嵌套对象进行响应式处理（性能不好，所以vue3 proxy 只在数据get 的时候判断是对象的话才去处理）
  let dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend(); //让这个属性的dep去存放这个watcher
        if (childOb) {
          //对于整个数组和对象都要进行收集依赖，不仅仅是属性
          childOb.dep.depend();
          if (Array.isArray(val)) {
            dependArray(val);
          }
        }
      }
      return val;
    },
    set(newValue) {
      if (newValue === val) return;
      observe(newValue);
      val = newValue;
      dep.notify();
      // console.log(val, "数据变动了");
    },
  });
}

export function observe(data) {
  if (typeof data !== "object" || data === null) return;
  if (data.__ob__ instanceof Observer) {
    return data__ob__;
  }
  return new Observer(data);
}
