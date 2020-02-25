import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import Antd from 'ant-design-vue';
import '@/styles/element-variables.scss'
import 'ant-design-vue/dist/antd.css';
// import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import vbutton from '@/components/Button/index.vue';
import '@/icons' // icon
import '@/permission' // permission control
import echarts from 'echarts' // 引入echarts
import _func from './func/main'// 引用文件
import _link from './func/mod/link'// 引用文件
import VueCropper from 'vue-cropper'
_func.FuncLink = _link.FuncLink.bind(_link);
import _mainmod from './mainmod'// 引用文件
Vue.prototype._func = _func// 挂载到Vue实例上面
Vue.prototype._mainmod = _mainmod// 挂载到Vue实例上面
Vue.prototype.$echarts = echarts
Vue.filter('FormatBaseTimeData', function (strtime) {
  let now = new Date(strtime);
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
});
window.onresize = function () {
  _mainmod.screenful.data += 1;
}

Vue.component('vButton', vbutton)
Vue.use(ElementUI)
Vue.use(Antd);

Vue.use(VueCropper)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});