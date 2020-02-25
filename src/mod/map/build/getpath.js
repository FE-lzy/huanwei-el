import _func from '@/func/main';
import _plugin from '../plugin';

let getpath = {
  program: null
};

getpath.FuncInit = function (options) {
  this.program = _plugin.GetDriving(options);
}
getpath.GetData = function(start, end) {
  return new Promise((resolve, reject) => {
    this.program.search(start, end, (status, result) => {
      if (status == 'complete') {
        if (result.info == 'OK') {
          let mainpath = [];
          for (let i = 0; i < result.routes[0].steps.length; i++) {
            let step = result.routes[0].steps[i];
            for (let n = 0; n < step.path.length; n++) {
              mainpath.push(step.path[n])
            }
          }
          resolve({ status: 'success', path: mainpath });
        } else {
          _func.showmsg('路线规化错误，请刷新后重试', 'error');
          reject({ status: 'fail' });
        }
      } else if (status == 'nodata') {
        _func.showmsg('检索返回结果，请确认后重试', 'error');
        reject({ status: 'nodata' });
      } else {
        _func.showmsg('路线规化错误，请刷新后重试', 'error');
        reject({ status: 'fail' });
      }
    });
  });
}

export default getpath;