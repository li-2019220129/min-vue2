import { initGlobalApi } from "./gloablApi";
import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import Watcher from "./observe/watcher";
import { initStateMixin } from "./state";

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

export default Vue;
