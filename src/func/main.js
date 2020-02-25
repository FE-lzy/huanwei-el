import util from './mod/util';
import notice from './mod/notice';
import BuildAxios from './mod/BuildAxios';

let _func = {
  axios: new BuildAxios(),
  page: {
    width: '',
    height: '',
    remwidth: 7.5,
    rem: ''
  },
  alert: {}
};
// DOM检测
_func.SetPage = function () {
  this.page.width = document.documentElement.clientWidth;
  this.page.height = document.documentElement.clientHeight;
};
_func.SetDpi = function (width) {
  var devicewidth = document.documentElement.clientWidth;
  this.page.rem = devicewidth / width * 100;
  this.page.remwidth = width / 100;
  document.getElementsByTagName('html')[0].style.cssText = 'font-size:' + this.page.rem + 'px !important';
};
// 设置工具
_func.SetUtil = function (utilfunc) {
  for (let v in utilfunc) {
    if (!this[v]) {
      this[v] = utilfunc[v];
    } else {
      console.error(`_func prop ${v} is already define`);
    }
  }
}

// 其他
_func.FuncDirectionToAngle = function (direction) {
  let defaultarr = {
    '北': 0,
    '东北': 45,
    '东': 90,
    '东南': 135,
    '南': 180,
    '西南': 225,
    '西': 270,
    '西北': 315
  };
  return defaultarr[direction] ? defaultarr[direction] : 0;
}

_func.SetToken = _func.axios.SetToken.bind(_func.axios);
_func.GetToken = _func.axios.GetToken.bind(_func.axios);
_func.RemoveToken = _func.axios.RemoveToken.bind(_func.axios);
_func.ajax = _func.axios.ajax.bind(_func.axios);
_func.post = _func.axios.post.bind(_func.axios);
_func.get = _func.axios.get.bind(_func.axios);
_func.postform = _func.axios.postform.bind(_func.axios);

_func.SetUtil(util);
notice.SetFunc(_func);
export default _func;