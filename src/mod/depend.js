
import _func from '@/func/main';

let environment = {
  data: 'normal',
  test: ''// 测试环境
};

//  基本功能:环境判断函数
environment.GetEnvironment = function () {
  let ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") { // 首先判断微信环境
    this.SetEnvironment('wx');
  } else { // 其他环境为web环境
    this.SetEnvironment('web');
  }
}
//  设置环境
environment.SetEnvironment = function (data) {
  if (data) {
    this.data = data;
  }
}
//  测试环境判断
environment.IsTest = function () {
  if (window.location.href.indexOf('http:// localhost') == 0) {
    this.test = true;
  }
}

let depend = {
  operate: '', //  当前运行状态
  load: {
    depend: '', //  depend 基本依赖
    page: { //  一级分页面加载状态
      location: '',
      road: '',
      set: '',
      device: '',
      cleanroute: ''
    }
  },
  environment: environment,
  page: {
    current: '', // 当前分页面的判断值
    list: [] // 当前分页面请求数据
  }
};

depend.GetEnvironment = function () {
  this.environment.GetEnvironment();
  this.environment.IsTest();
};

depend.LoadMod = function ({ page, modlist = [] }) {
  return new Promise((resolve, reject) => {
    this._FuncPage('set', page, modlist);
    if (!this.operate) {
      this._LoadModFunc().then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    } else {
      resolve({ status: 'waiting' });
    }
  });
}
//  基本功能:设置page状态
depend._FuncPage = function (act, page, modlist) {
  if (act == 'set') {
    this.page.current = page;
    this.page.list = modlist;
  } else if (act == 'loading') {
    if (this.load.page[this.page.current] != 'success') {
      this.load.page[this.page.current] = 'loading';
    }
    this.operate = 'loading';
  } else if (act == 'success') {
    this.load.page[this.page.current] = 'success';
    this.operate = '';
  } else if (act == 'fail') {
    this.load.page[this.page.current] = '';
    this.operate = '';
  }
}
//  基本功能:加载数据的基本判断，如需要加载的数据为空，则直接返回success，但实际上并未进行加载/基本上只会在依赖加载完成后出现
depend._LoadModFunc = function () {
  return new Promise((resolve, reject) => {
    this._FuncPage('loading');
    this._LoadModNext().then(res => { // 此处可进行统一的页面加载完成后的逻辑操作
      this._FuncPage('success');
      console.log('页面:' + this.page.current + ' - 状态:' + this.load.page[this.page.current]);
      resolve(res);
    }, res => {
      this._FuncPage('fail');
      reject(res);
    });
  });
}
//  基本功能:从page中拉取对应模块并顺序加载
depend._LoadModNext = function () {
  return new Promise((resolve, reject) => {
    if (this.page.list.length > 0) { //  加载列表不为空则进行加载操作
      let modname = this.page.list.shift();
      this.LoadModDo(modname).then(res => {
        console.log('模块:' + modname + ' - 状态:' + res.status);
        this._LoadModNext().then(res => { //  当前模块加载完毕后,调用加载函数继续进行加载/当前回调会在完成后直接回调到此处进行回调,将结果最终返回到第一次调用加载函数处
          resolve(res);
        }, res => {
          reject(res);
        });
      }, res => { //  错误回调
        reject(res);
      });
    } else { //  加载列表完成,设置状态为'success',并返回成功回调
      resolve({ status: 'success' });
    }
  });
}
export default depend;
