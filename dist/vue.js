(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  var strats = {};
  var LIFECYCLE = ["beforeCreate", "created"];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        if (p) {
          return p.concat(c);
        } else {
          return [c];
        }
      } else {
        return p;
      }
    };
  });
  strats.components = function (parentVal, childVal) {
    var res = Object.create(parentVal);
    if (childVal) {
      for (var key in childVal) {
        res[key] = childVal[key]; // 返回的是构造的对象，可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己的身上
      }
    }
    return res;
  };
  function mergeOptions(parent, child) {
    var options = {};
    for (var key in parent) {
      mergeField(key);
    }
    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }
    function mergeField(key) {
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key];
      }
    }
    return options;
  }

  function initGlobalApi(Vue) {
    Vue.options = {
      _base: Vue
    };
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
    Vue.extend = function (options) {
      function Sub() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagClose = /^\s*(\/?)>/;
  var defaultTagRE = /{\{((?:.|\r?\n)+?)\}\}/g;
  function genProps(attrs) {
    var str = "";
    var _loop = function _loop() {
      if (attrs[i].name === "style") {
        var styleObj = {};
        attrs[i].value.split(";").forEach(function (item) {
          var _item$split = item.split(":"),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          key = key.trim();
          styleObj[key] = value;
        });
        attrs[i].value = styleObj;
      }
      str += "".concat(attrs[i].name, ":").concat(JSON.stringify(attrs[i].value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function gen(node) {
    if (node.type === 1) {
      return codeGen(node);
    } else {
      var text = node.text;
      var _boolean = text.match(defaultTagRE);
      if (!_boolean) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  }
  function codeGen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length ? genProps(ast.attrs) : "null").concat(ast.children.length ? ",".concat(children) : "", ")");
    return code;
  }
  function parseHTML(html) {
    var stack = [];
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var currentParent;
    var root;
    function createASTElement(tag, attrs, parent) {
      return {
        tag: tag,
        attrs: attrs,
        parent: parent,
        type: ELEMENT_TYPE,
        children: []
      };
    }
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs, currentParent);
      if (!root) {
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node;
    }
    function chars(text) {
      text = text.replace(/\s*/g, "");
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      stack.pop();
      currentParent = stack[stack.length - 1];
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        var _end;
        while (!(_end = html.match(startTagClose)) && html.match(attribute)) {
          var attrs = html.match(attribute);
          match.attrs.push({
            name: attrs[1],
            value: attrs[3] || attrs[4] || attrs[5] | true
          });
          advance(attrs[0].length);
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
        // console.log(match);
        // console.log(html);
      }
      return false;
    }
    while (html) {
      var textEnd = html.indexOf("<");
      if (textEnd === 0) {
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd);
        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }
    return root;
  }
  function compileToFunction(template) {
    //1.将template转换成ast语法树
    //2生成render方法（render方法执行后，会生成虚拟dom）
    var ast = parseHTML(template);
    // console.log(ast, "ast");
    var code = codeGen(ast);
    code = "with(this){return ".concat(code, "}");
    // console.log(code);
    var render = new Function(code);
    return render;
  }

  var oldArrayProto = Array.prototype;
  var arrayMethods = Object.create(oldArrayProto);
  var methods = ["pop", "unshift", "shift", "splice", "reverse", "sort", "push"];
  methods.forEach(function (key) {
    arrayMethods[key] = function () {
      var ob = this.__ob__;
      var res;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      switch (key) {
        case "push":
        case "unshift":
          res = args;
          break;
        case "splice":
          res = args.slice(2);
          break;
      }
      if (res) {
        ob.observeArray(res);
      }
      ob.dep.notify();
      return oldArrayProto[key].apply(this, args);
    };
  });

  var id = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id++;
      this.subs = [];
    }
    return _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
  }();
  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
    console.log(stack);
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 给每个对象和数组都增加收集功能
      this.dep = new Dep(); //$set做准备

      Object.defineProperty(data, "__ob__", {
        enumerable: false,
        value: this
      });
      if (Array.isArray(data)) {
        //重写数组方法，这样数据变化就可以监控到
        Object.setPrototypeOf(data, arrayMethods);
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    return _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (item) {
          defineReactive(data, item, data[item]);
        });
      }
    }]);
  }();
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }
  function defineReactive(obj, key, val) {
    var childOb = observe(val); // 递归对嵌套对象进行响应式处理（性能不好，所以vue3 proxy 只在数据get 的时候判断是对象的话才去处理）
    var dep = new Dep();
    Object.defineProperty(obj, key, {
      get: function get() {
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
      set: function set(newValue) {
        if (newValue === val) return;
        observe(newValue);
        val = newValue;
        dep.notify();
        // console.log(val, "数据变动了");
      }
    });
  }
  function observe(data) {
    if (_typeof(data) !== "object" || data === null) return;
    if (data.__ob__ instanceof Observer) {
      return data__ob__;
    }
    return new Observer(data);
  }

  var uid = 0;

  // 1.当我们创建渲染函数的时候我们会把当前的渲染watcher放到Dep.target上
  // 2.调用_render()会取值走到get上
  var Watcher = /*#__PURE__*/function () {
    //不同组件有不同的watcher，每个组件都会去new Watcher，可以做到局部更新
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
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
    return _createClass(Watcher, [{
      key: "get",
      value: function get() {
        pushTarget(this);
        var value = this.getter.call(this.vm);
        popTarget();
        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) {
          this.deps[i].depend();
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get();
        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          // 如果是计算属性，依赖的值发生了变化就标识计算属性的值是脏数据了
          this.dirty = true;
        } else {
          // this.get();
          queueWatcher(this); //异步更新
        }
      }
    }]);
  }();
  var queue = [];
  var has = {};
  var pending = false;
  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    flushQueue.forEach(function (queue) {
      return queue.run();
    });
    queue = [];
    has = {};
    pending = false;
  }
  function queueWatcher(watcher) {
    var id = watcher.id;
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
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice(0); //拷贝的目的是在代码运行中callbacks 可能会添加新的数据，但他要放到下次去调用而不是现在
    waiting = true;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); //按顺序依次执行
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

  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks); //这里传入的回调是异步执行的
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }
  function nextTick(cb) {
    callbacks.push(cb); //这边他用数组,是为了防止多次调用nextTick然后创建多个定时器会消耗性能
    if (!waiting) {
      timerFunc();
      waiting = true;
    }
  }

  function initState(vm) {
    var opts = vm.$options;
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
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
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
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === "function" ? data.call(vm) : data;
    for (var key in data) {
      proxy(vm, "_data", key);
    }
    observe(data);
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watcher = vm._computedWatcher = {};
    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === "function" ? userDef : userDef.get;
      console.log(getter, "getter");
      watcher[key] = new Watcher(vm, getter, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(target, key, userDef) {
    var setter = userDef.set || function () {};
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  // 计算属性根本不会收集依赖，只会让自己依赖的属性去收集依赖
  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatcher[key];
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
  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (exprOrFn, cb) {
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  //h() _c()
  // _c('div',{},...children)

  var isReservedTag = function isReservedTag(tag) {
    return ["a", "p", "li", "ul", "div", "img", "span", "button"].includes(tag);
  };
  function createElementVNode(vm, tag) {
    var _data;
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    data = (_data = data) !== null && _data !== void 0 ? _data : {};
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    if (isReservedTag(tag)) {
      return vnode(vm, tag, key, data, children);
    } else {
      //创造一个组件的虚拟节点
      var Ctor = vm.$options.components[tag]; // 组件的构造函数
      return createComponentVnode(vm, tag, key, data, children, Ctor);
    }
    // return vnode(vm, tag, key, data, children);
  }
  function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if (_typeof(Ctor) === "object") {
      Ctor = vm.$options._base["extends"](Ctor);
    }
    data.hook = {
      init: function init(vnode) {
        var instance = vnode.componentInstance = new vnode.componentOptions.Ctor();
        instance.$mount();
      }
    };
    return vnode(vm, tag, key, data, children, undefined, {
      Ctor: Ctor
    });
  }
  // _v('text')
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  //ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身
  // 虚拟dom描述的是dom元素,可以增加一些自定义属性
  function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text,
      componentOptions: componentOptions
    };
  }
  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createComponent(vnode) {
    var i = vnode.data;
    if ((i = i.hook) && (i = i.init)) {
      i(vnode);
    }
    if (vnode.componentInstance) {
      return true;
    }
  }
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === "string") {
      //创建元素，也要区分是组件还是元素
      if (createComponent(vnode)) {
        return vnode.componentInstance.$el;
      }
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    //老的属性有,新的没有,删除
    var oldStyle = oldProps.style || {};
    var newStyle = props.style || {};
    for (var key in oldStyle) {
      if (!newStyle[key]) {
        el.style[key] = "";
      }
    }
    for (var _key in oldProps) {
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }
    for (var _key2 in props) {
      if (_key2 === "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldVnode, vnode) {
    if (!oldVnode) {
      return createElm(vnode);
    }
    var isRealElement = oldVnode.nodeType;
    if (isRealElement) {
      var elm = oldVnode;
      var parentElm = elm.parentNode;
      var newElm = createElm(vnode);
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
      var _el = createElm(vnode);
      oldVnode.el.parentNode.replaceChild(_el, oldVnode.el);
      return _el;
    }

    //文本情况,文本期望比较一下文本的内容
    var el = vnode.el = oldVnode.el;
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text;
      }
    }

    //标签,标签的更新
    patchProps(el, oldVnode.data, vnode.data);
    var oldChildren = oldVnode.children || [];
    var newChildren = vnode.children || [];
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
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      el.appendChild(createElm(child));
    }
  }
  function updateChildren(el, oldChildren, newChildren) {
    var oldStartIndex = 0;
    var oldStartVnode = oldChildren[oldStartIndex];
    var oldEndIndex = oldChildren.length - 1;
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartIndex = 0;
    var newStartVnode = newChildren[newStartIndex];
    var newEndIndex = newChildren.length - 1;
    var newEndVnode = newChildren[newEndIndex];
    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }
    var map = makeIndexByKey(oldChildren);
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
        var moveIndex = map[newStartVnode.key];
        if (moveIndex !== undefined) {
          var moveVNode = oldChildren[moveIndex];
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
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var child = createElm(newChildren[i]);
        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
        el.insertBefore(child, anchor);
        console.log(anchor);
      }
    }
    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i] !== null) {
          var _child = oldChildren[_i];
          el.removeChild(_child.el);
        }
      }
    }
  }

  function initLifecycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // console.log("_upload", vnode);
      var vm = this;
      var el = vm.$el;
      var prevVnode = vm._vnode;
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
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    // _v()
    Vue.prototype._v = function () {
      console.log(createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments))), "12122111");
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };
    Vue.prototype._render = function () {
      //当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
      var vm = this;
      return vm.$options.render.call(vm);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el;
    // 1. 调用render方法产生虚拟dom
    var uploadComponent = function uploadComponent() {
      vm._update(vm._render());
    };
    //数据变化重新渲染视图
    new Watcher(vm, uploadComponent, true);
    // 2. 根据虚拟dom产生真实dom
    // 3. 插入到el
  }

  // vue 核心流程 （1）创造了响应式数据 （2）模板转换成ast语法树
  // （3）将ast 转换成渲染函数 （4）将渲染函数执行后产生虚拟dom （5）根据虚拟dom 生成真实dom

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];
    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  function initMixin(Vue) {
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
      var vm = this;
      var ops = vm.$options;
      if (!ops.render) {
        var template = ops.template;
        if (!template && el) {
          template = el.outerHTML;
        }
        if (template) {
          var render = compileToFunction(template);
          ops.render = render;
        }
      }
      // console.log(ops.render, "render");
      mountComponent(vm, el);
    };
  }

  function Vue(options) {
    // vue初始化操作
    this._init(options);
  }

  // 初始化操作
  initMixin(Vue);

  // vm_update vm_render
  initLifecycle(Vue);

  //全局api
  initGlobalApi(Vue);

  // 实现了nextTick和$watch
  initStateMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
