
import _func from '@/func/main';

let device = {
  list: {
    parking: {
      prop: 'parking'
    },
    water: {
      prop: 'water'
    },
    trash: {
      prop: 'trash'
    },
    landfill: {
      prop: 'landfill'
    },
    incinerator: {
      prop: 'incinerator'
    },
    toilet: {
      prop: 'toilet'
    },
    transfer: {
      prop: 'transfer'
    },
    gas: {
      prop: 'gas'
    }
  }
};

device.GetList = function(act = 'total') {
  let list = [];
  for (let v in this.list) {
    if (act == 'other' && v == 'trash') {
      //
    } else {
      list.push(v);
    }
  }
  return list;
}

device.FuncInit = function (act, moddata) {
  return new Promise((resolve, reject) => {
    let list = this.GetList(act);
    this.FuncInitDo(moddata, list).then(res => {
      resolve(res);
    }, res => {
      reject(res);
    });
  });
};

device.FuncInitDo = function (moddata, list) {
  return new Promise((resolve, reject) => {
    let name = list.shift();
    this.FuncInitItem(moddata, name).then(res => {
      if (list.length == 0) {
        resolve(res);
      } else {
        this.FuncInitDo(moddata, list).then(res => {
          resolve(res);
        }, res => {
          reject(res);
        })
      }
    }, res => {
      reject(res);
    });
  });
};

device.FuncInitItem = function (moddata, modname) {
  return new Promise((resolve, reject) => {
    moddata.data[modname].FuncInit().then(res => {
      // console.log(`device ${modname} is loaded `);
      resolve(res);
    }, res => {
      reject(res);
    });
  });
};

device.GetMainList = function (type, moddata) {
  let mainlist = [];
  if (type == 'total') {
    for (let v in this.list) {
      mainlist = mainlist.concat(moddata.data[v].GetList());
    }
  } else {
    for (let v in this.list) {
      if (v == type) {
        mainlist = mainlist.concat(moddata.data[v].GetList());
        break;
      }
    }
  }

  this.SortList(mainlist);
  return mainlist;
};

device.SortList = function (list) {
  list.sort((a, b) => {
    return a.data.detail.createtimestamp - b.data.detail.createtimestamp;
  });
}

device.DelItem = function (list, moddata) {
  for (let i = 0; i < list.length; i++) {
    let itemdata = list[i];
    let modname = itemdata.data.detail.type;
    moddata.data[modname].DelItem(itemdata);
  }
}

export default device;
