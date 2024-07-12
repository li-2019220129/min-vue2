import { initGlobalApi } from "./gloablApi";
import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

function Vue(options) {
  // vue初始化操作
  this._init(options);
}

Vue.prototype.$nextTick = nextTick;
// 初始化操作
initMixin(Vue);

initLifecycle(Vue);

initGlobalApi(Vue);
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
export default Vue;
