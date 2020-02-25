import axios from 'axios';
import link from './link';
import util from './util';
import notice from './notice';
import { getToken, setToken, removeToken } from '@/utils/auth'

class BuildAxios {
  load = '';
  environment = process.env.NODE_ENV;
  option = {
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    restype: 'json' // 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  };
  data = {
    token: {
      type: 'header',
      check: true,
      data: {

      }
    },
    format: {
      replace: false, // 存在值会直接更改所有ajax请求地址
      offset: true // 为TRUE会进行URL全局检查更改
    }
  };
  constructor (tokentype) {
    this.load = 'success';
    if (tokentype) {
      this.SetTokenType(tokentype);
    }
  }
  SetTokenType(tokentype) {
    this.data.token.type = tokentype;
  }
  GetTokenType() {
    return this.data.token.type;
  }
  // AJAX函数
  SetToken(tokenname, tokendata, notset) {
    this.data.token.data[tokenname] = tokendata;
    if (!notset) {
      setToken(tokenname, tokendata);
    }
  }
  GetToken(tokenname) {
    let tokendata = this.data.token.data[tokenname];
    if (!tokendata) {
      tokendata = getToken(tokenname);
      if (tokendata) {
        this.SetToken(tokenname, tokendata, true);
      }
    }
    return tokendata;
  }
  RemoveToken(tokenname) {
    this.data.token.data[tokenname] = false;
    removeToken(tokenname);
    window.location.reload();
  }
  FormatUrl(url) {
    if (url.indexOf('https://') == 0 || url.indexOf('http://') == 0) {
      // url=url;
    } else {
      if (this.environment == 'production') { // 生产环境
        url = 'http://192.168.0.26:18000' + url;
      } else { // 开发环境
        if (url.indexOf('phpnop/') == 0) {
          url = 'http://192.168.1.17/' + url;
        } else {
          url = 'http://192.168.0.26:18000' + url;
        }
      }
    }
    return url;
  }
  JsondataToFormdata(jsondata) {
    let formdata = new FormData();
    for (let v in jsondata) {
      if (util.CheckType(jsondata[v]) == 'object') {
        if (jsondata[v].toString() == '[object File]') {
          formdata.append(v, jsondata[v]);
        } else {
          formdata[v] = this.JsondataToFormdata(jsondata[v]);
        }
      } else {
        formdata.append(v, jsondata[v]);
      }
    }
    return formdata;
  }

  ajax(type, url, ajaxdata, tokenname, option) {
    return new Promise((resolve, reject) => {
      let headers = util.copyjson(this.option.headers);
      let restype = this.option.restype;
      if (this.data.format.replace) {
        url = this.data.format.replace;
      } else if (this.data.format.offset) {
        url = this.FormatUrl(url);
      }
      if (!this.data.token.check) {
        tokenname = false;
      }
      if (tokenname) {
        let tokentype = this.GetTokenType();
        if (tokentype == 'body') {
          ajaxdata[tokenname] = this.GetToken(tokenname);
        } else if (tokentype == 'header') {
          headers['token'] = this.GetToken(tokenname);
        }
      }
      if (type == 'formdata') {
        type = 'post';
        headers['Content-Type'] = 'multipart/form-data';
        ajaxdata = this.JsondataToFormdata(ajaxdata);
      } else {
        ajaxdata = JSON.stringify(ajaxdata);
      }
      if (option) {
        if (option.restype) { // 返回值的格式
          restype = option.restype;
        }
      }
      // console.log(headers, ajaxdata);
      axios({
        method: type,
        url: url,
        data: ajaxdata,
        responseType: restype,
        headers: headers
      }).then(res => {
        if (res.data.code == 0) {
          resolve({
            status: 'success',
            data: res.data.data,
            message: res.data.msg
          });
        } else if (res.data.code == 401) { // 需要登录
          this.RemoveToken(tokenname);
          link.FuncLink('router', { path: '/login' });
          reject({
            status: 'fail',
            code: res.data.code,
            from: 'login',
            message: res.data.msg
          });
        } else {
          notice.showmsg(res.data.msg, 'error');
          reject({
            status: 'fail',
            code: res.data.code,
            from: 'serve',
            data: res.data,
            message: res.data.msg
          });
        }
      }).catch(error => {
        notice.showmsg('程序错误，请刷新后重试', 'error');
        reject({
          status: 'fail',
          code: false,
          from: 'error',
          error: error,
          message: '程序错误，请刷新后重试'
        });
      });
    });
  }
  post(url, ajaxdata, tokenname, option) {
    let self = this;
    return new Promise(function (resolve, reject) {
      self.ajax('post', url, ajaxdata, tokenname, option).then(function (res) {
        resolve(res);
      }, function (res) {
        reject(res);
      });
    });
  }
  postform(url, ajaxdata, tokenname, option) {
    let self = this;
    return new Promise(function (resolve, reject) {
      self.ajax('formdata', url, ajaxdata, tokenname, option).then(function (res) {
        resolve(res);
      }, function (res) {
        reject(res);
      });
    });
  }
  get(url, ajaxdata, tokenname, option) {
    let self = this;
    return new Promise(function (resolve, reject) {
      self.ajax('get', url, ajaxdata, tokenname, option).then(function (res) {
        resolve(res);
      }, function (res) {
        reject(res);
      });
    });
  }

  // 其他
  toString() {
    return '函数转换字符串未定义';
  }
}

export default BuildAxios;