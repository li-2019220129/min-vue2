import { observe } from "./observe";
import Dep from "./observe/dep";
import Watcher, { nextTick } from "./observe/watcher";
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}

function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, key, handler) {
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(key, handler);
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}
export function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === "function" ? data.call(vm) : data;
  for (let key in data) {
    proxy(vm, "_data", key);
  }
  observe(data);
}

function initComputed(vm) {
  let computed = vm.$options.computed;
  const watcher = (vm._computedWatcher = {});
  for (let key in computed) {
    let userDef = computed[key];
    const getter = typeof userDef === "function" ? userDef : userDef.get;
    console.log(getter, "getter");
    watcher[key] = new Watcher(vm, getter, {
      lazy: true,
    });
    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

// 计算属性根本不会收集依赖，只会让自己依赖的属性去收集依赖
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatcher[key];
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      //计算属性出栈后如果还有渲染watcher，则应该让计算属性watcher里面的属性也去收集上一层watcher
      watcher.depend();
    }
    return watcher.value;
  };
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;

  Vue.prototype.$watch = function (exprOrFn, cb) {
    new Watcher(
      this,
      exprOrFn,
      {
        user: true,
      },
      cb
    );
  };
}
