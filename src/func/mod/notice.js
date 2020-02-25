import ElementUI from 'element-ui'

let notice = {
  loadingfunc: {
    prog: null
  }
};

notice.SetNotice = function (emui) {
  this.Alert = emui.Alert;
  this.MessageBox = emui.MessageBox;
  this.Message = emui.Message;
  this.Loading = emui.Loading;
}

notice.showmsg = function (content, type = 'info', time = 2000, offset = 120) {
  this.Message({
    message: content,
    type: type,
    duration: time,
    offset: offset
  });
}

notice.showload = function (text = '加载中', background = 'rgba(0,0,0,0.5)', spinner = 'el-icon-loading', custclass = '') {
  this.loadingfunc.prog = this.Loading.service({
    text: text,
    spinner: spinner,
    background: background,
    customClass: custclass
  });
}
notice.hideload = function () {
  if (this.loadingfunc.prog) {
    this.loadingfunc.prog.close();
  }
}

notice.SetFunc = function (func) {
  func.loadingfunc = this.loadingfunc;
  func.Alert = this.Alert;
  func.MessageBox = this.MessageBox;
  func.Message = this.Message;
  func.Loading = this.Loading;
  func.showmsg = this.showmsg;
  func.showload = this.showload;
  func.hideload = this.hideload;
}

notice.SetNotice(ElementUI);

export default notice;