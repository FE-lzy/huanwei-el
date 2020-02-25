import _func from '@/func/main';
import _plugin from '../plugin';

let mapsearch = {
  program: _plugin.GetMapSearch()
};

mapsearch.GetData = function (lng, lat) {
  return new Promise((resolve, reject) => {
    this.program.getAddress([lng, lat], (status, result) => {
      if (status == 'complete' && result.regeocode) {
        resolve({ status: 'success', position: result.regeocode.formattedAddress });
      } else {
        _func.showmsg('地址信息获取失败，请确认后重试', 'error');
        reject({ status: 'fail' });
      }
    });
  });
}

export default mapsearch;