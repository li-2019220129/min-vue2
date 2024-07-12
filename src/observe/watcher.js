import Dep, { popTarget, pushTarget } from "./dep";

let uid = 0;

// 1.当我们创建渲染函数的时候我们会把当前的渲染watcher放到Dep.target上
// 2.调用_render()会取值走到get上
class Watcher {
  //不同组件有不同的watcher，每个组件都会去new Watcher，可以做到局部更新
  constructor(vm, exprOrFn, options, cb) {
    this.id = uid++;
    this.vm = vm;
    this.renderWatcher = options; //一个渲染watcher
    this.depsId = new Set();
    this.cb = cb;
    this.deps = []; //后续实现computed 和一些清理工作需要的
    if (typeof exprOrFn == "string") {
      this.getter = function () {
        return vm[exprOrFn];
      };
    } else {
      this.getter = exprOrFn;
    }
    this.lazy = options && options.lazy;
    this.dirty = this.lazy; //缓存值
    this.user = options && options.user;
    this.value = this.lazy ? undefined : this.get();
  }
  get() {
    pushTarget(this);
    let value = this.getter.call(this.vm);
    popTarget();
    return value;
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
  run() {
    let oldValue = this.value;
    let newValue = this.get();
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
  update() {
    if (this.lazy) {
      // 如果是计算属性，依赖的值发生了变化就标识计算属性的值是脏数据了
      this.dirty = true;
    } else {
      // this.get();
      queueWatcher(this); //异步更新
    }
  }
}

let queue = [];
let has = {};
let pending = false;

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  flushQueue.forEach((queue) => queue.run());
  queue = [];
  has = {};
  pending = false;
}
function queueWatcher(watcher) {
  let id = watcher.id;
  if (has[id] == null) {
    queue.push(watcher);
    has[id] = true;

    if (!pending) {
      nextTick(flushSchedulerQueue);
      pending = true;
    }
    //异步更新
  }
}

let callbacks = [];
let waiting = false;

function flushCallbacks() {
  let cbs = callbacks.slice(0); //拷贝的目的是在代码运行中callbacks 可能会添加新的数据，但他要放到下次去调用而不是现在
  waiting = true;
  callbacks = [];
  cbs.forEach((cb) => cb()); //按顺序依次执行
}

//nextTick 的逻辑是维护了一个任务队列，
//但这个任务的执行是放到异步里面执行的，
//数据更改后的异步跟新也是用的这个逻辑，
//而且是和自己在代码里面使用nextTick是有顺序的，
//谁在前面谁先执行，这样当我在代码里面先调用nextTick,
//然后更改数据，nextTick里面拿到的dom里的数据还是旧的，
//因为添加的任务数组中，渲染逻辑函数在后面，
//所以先执行了自己的逻辑，然后执行了渲染的逻辑，
//所以拿到的dom里的数据是旧的。

// nextTick没有直接使用某个api,而是采用了优雅降级的方式，
// 内部先采用的是promise（ie 不兼容） MutationObserver（h5的api）  （ie共享）setImmediate setTimeout

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  };
} else if (MutationObserver) {
  let observer = new MutationObserver(flushCallbacks); //这里传入的回调是异步执行的
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    textNode.textContent = 2;
  };
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  };
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    timerFunc();
    waiting = true;
  }
}

// 需要给每个属性增加一个dep，其目的是为了收集观察者，当属性发生变化时，通知观察者更新
// 一个视图中会有n个属性，（n个属性对应一个视图） n个dep对应一个watcher
// 一个属性对应多个视图（多对多）
export default Watcher;
