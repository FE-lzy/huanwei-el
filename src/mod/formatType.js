import _func from '@/func/main';

let formatType = {
  load: {
    data: ''
  },
  mod: {
    car: {
      dictionary: {
        maintype: {
          'clean': {
            name: '清洁车',
            shortname: '清',
            prop: 'clean'
          },
          'water': {
            name: '洒水车',
            shortname: '洒',
            prop: 'water'
          },
          'rubbish': {
            name: '垃圾车',
            shortname: '垃',
            prop: 'rubbish'
          },
          'sweeper': {
            name: '洗扫车',
            shortname: '洗',
            prop: 'sweeper'
          }
        },
        workstatus: {
          '0010': {
            name: '作业中',
            prop: 'atwork',
            color: '#44fd7d'
          },
          '0020': {
            name: '空闲中',
            prop: 'notwork',
            color: '#e5e5e5'
          }
        },
        carstatus: {
          '0000': {
            name: '离线',
            prop: 'offline',
            color: '#b2b2b2'
          },
          '1000': {
            name: '停车',
            prop: 'park',
            color: '#fbb03b'
          },
          '2000': {
            name: '行驶',
            prop: 'drive',
            color: '#0fa83e'
          },
          '3000': {
            name: '充电',
            prop: 'charge',
            color: '#5cdeff'
          }
        },
        powertype: {
          '001': {
            name: '汽油车',
            prop: 'oil'
          },
          '002': {
            name: '新能源车',
            prop: 'electric'
          },
          '003': {
            name: '柴油车',
            prop: 'oil'
          },
          '004': {
            name: '油电混合车',
            prop: 'oil'
          }
        }
      },
      icon: {
        clean: require('./../../public/images/carsvg/clean.png'),
        water: require('./../../public/images/carsvg/water.png'),
        rubbish: require('./../../public/images/carsvg/rubbish.png'),
        sweeper: require('./../../public/images/carsvg/sweeper.svg'),
        other: require('./../../public/images/carsvg/other.png')
      }
    },
    road: {
      dictionary: {
        type: {
          single: {
            name: '单向道',
            prop: 'single'
          },
          double: {
            name: '双向道',
            prop: 'double'
          }
        }
      }
    },
    device: {
      dictionary: {
        data: {
          trash: {
            name: '垃圾桶',
            prop: 'trash'
          },
          parking: {
            name: '停车场',
            prop: 'parking'
          },
          water: {
            name: '加水点',
            prop: 'water'
          },
          landfill: {
            name: '垃圾填埋场',
            prop: 'landfill'
          },
          incinerator: {
            name: '垃圾焚烧厂',
            prop: 'incinerator'
          },
          toilet: {
            name: '公共厕所',
            prop: 'toilet'
          },
          transfer: {
            name: '中转站',
            prop: 'transfer'
          },
          gas: {
            name: '加油站',
            prop: 'gas'
          }
        },
        trash: {
          distribution: {
            allocated: {
              name: '已分配',
              prop: 'allocated'
            },
            unallocated: {
              name: '未分配',
              prop: 'unallocated'
            }
          },
          status: {
            finished: {
              name: '已收运',
              prop: 'finished'
            },
            unfinished: {
              name: '未收运',
              prop: 'unfinished'
            }
          }
        }
      }
    }
  }
};
formatType.GetMainIcon = function (maintype) {
  if (maintype == 'nodata') {
    maintype = 'other';
  }
  return this.mod.car.icon[maintype];
};
formatType.GetList = function (type) {
  let list = [];
  if (type == 'device') {
    for (let v in this.mod.device.dictionary.data) {
      list.push({
        name: this.mod.device.dictionary.data[v].name,
        prop: v
      })
    }
  }
  return list;
};

formatType.GetIcon = function (target, payload) {
  let icondata = {
    src: ''
  };
  // 后缀
  let suffix = '.svg';
  if (target == 'car') {
    // 图片路径
    let src = '/images/carsvg/';
    if (payload.maintype == 'nodata' || payload.carstatus == 'nodata' || payload.workstatus == 'nodata') {
      icondata.name = '无';
      icondata.src = src + 'other' + suffix;
    } else {
      if (payload.workstatus == 'atwork') {
        suffix = '-atwork.gif';
      } else {
      }
      if (payload.maintype == 'water') {
        icondata.name = '洒';
      } else if (payload.maintype == 'clean') {
        icondata.name = '清';
      } else if (payload.maintype == 'sweeper') {
        icondata.name = '洗';
      } else {
        icondata.name = '垃';
      }
      if (payload.carstatus == 'offline') {
        icondata.src = src + payload.maintype + '-' + payload.carstatus + suffix;
      } else if (payload.carstatus == 'park') {
        icondata.src = src + payload.maintype + '-' + payload.carstatus + suffix;
      } else if (payload.carstatus == 'drive') {
        if (payload.workstatus == 'atwork') {
          suffix = '-atwork.gif';
          icondata.src = src + payload.maintype + '-' + payload.carstatus + suffix;
        } else {
          suffix = '.svg';
          icondata.src = src + payload.maintype + suffix;
        }
      } else if (payload.carstatus == 'charge') {
        suffix = '.svg';
        icondata.src = src + payload.maintype + '-' + payload.carstatus + suffix;
      }
    }
  } else if (target == 'trash') {
    // 图片路径
    let src = '/images/trashsvg/';
    icondata.src = src + 'trash' + suffix;
  }
  return icondata;
};

formatType.FuncInit = function () {
  return new Promise((resolve, reject) => {
    if (this.load.data != 'success') {
      this.load.data = 'loading';
      _func.post('/enum/tree', {}, 'POST').then(res => {
        this.SetData(res.data);
        this.load.data = 'success';
        resolve(res);
      }, res => {
        reject(res);
      });
    } else {
      resolve({
        status: 'success'
      });
    }
  });
};

formatType.SetData = function (res) {
  if (res.vehicleJobStatus) {
    for (let v in this.mod.car.dictionary.workstatus) {
      if (res.vehicleJobStatus[v]) {
        this.mod.car.dictionary.workstatus[v].name = res.vehicleJobStatus[v];
      }
    }
  }
  if (res.vehicleStatus) {
    for (let v in this.mod.car.dictionary.carstatus) {
      if (res.vehicleStatus[v]) {
        this.mod.car.dictionary.carstatus[v].name = res.vehicleStatus[v];
      }
    }
  }
  if (res.vehicleUseSortStatus) {
    for (let v in this.mod.car.dictionary.maintype) {
      if (res.vehicleUseSortStatus[v]) {
        this.mod.car.dictionary.maintype[v].name = res.vehicleUseSortStatus[v];
      }
    }
  }
  if (res.vehicleFuelType) {
    for (let v in this.mod.car.dictionary.powertype) {
      if (res.vehicleFuelType[v]) {
        this.mod.car.dictionary.powertype[v].name = res.vehicleFuelType[v];
      }
    }
  }
  if (res.laneType) {
    for (let v in this.mod.road.dictionary.type) {
      if (res.laneType[v]) {
        this.mod.road.dictionary.type[v].name = res.laneType[v];
      }
    }
  }
  if (res.facilityType) {
    for (let v in this.mod.device.dictionary.data) {
      if (res.facilityType[v]) {
        this.mod.device.dictionary.data[v].name = res.facilityType[v];
      }
    }
  }
  if (res.distributionStatus) {
    for (let v in this.mod.device.dictionary.trash.distribution) {
      if (res.distributionStatus[v]) {
        this.mod.device.dictionary.trash.distribution[v].name = res.distributionStatus[v];
      }
    }
  }
  if (res.collectorStatus) {
    for (let v in this.mod.device.dictionary.trash.status) {
      if (res.collectorStatus[v]) {
        this.mod.device.dictionary.trash.status[v].name = res.collectorStatus[v];
      }
    }
  }
};

formatType.GetType = function (mod, payload) {
  if (mod == 'car') {
    if (this.mod[mod]) {
      if (this.mod[mod].dictionary[payload.target]) {
        if (this.mod[mod].dictionary[payload.target][payload.data]) {
          return this.mod[mod].dictionary[payload.target][payload.data];
        } else {
          return {
            prop: 'nodata',
            noprop: 'nodata',
            name: '其他',
            color: '#cccccc'
          };
        }
      } else {
        return {
          prop: 'nodata',
          noprop: 'noname',
          name: '其他',
          color: '#cccccc'
        };
      }
    } else {
      return {
        prop: 'nodata',
        noprop: 'nomod',
        name: '其他',
        color: '#cccccc'
      };
    }
  } else if (mod == 'trash') {
    if (this.mod[mod]) {
      if (this.mod[mod].dictionary[payload.target]) {
        if (this.mod[mod].dictionary[payload.target][payload.data]) {
          return this.mod[mod].dictionary[payload.target][payload.data];
        } else {
          return {
            prop: 'nodata',
            noprop: 'nodata',
            name: '其他',
            color: '#cccccc'
          };
        }
      } else {
        return {
          prop: 'nodata',
          noprop: 'noname',
          name: '其他',
          color: '#cccccc'
        };
      }
    } else {
      return {
        prop: 'nodata',
        noprop: 'nomod',
        name: '其他',
        color: '#cccccc'
      };
    }
  }
};
formatType.GetDeviceType = function (mod, payload) {
  if (mod == 'trash') {
    if (this.mod.device.dictionary[mod]) {
      if (this.mod.device.dictionary[mod][payload.target]) {
        return this.mod.device.dictionary[mod][payload.target][payload.data];
      } else {
        return {
          prop: 'nodata',
          noprop: 'nodata',
          name: '其他',
          color: '#cccccc'
        };
      }
    } else {
      return {
        prop: 'nodata',
        noprop: 'noname',
        name: '其他',
        color: '#cccccc'
      };
    }
  }
};

formatType.GetDevice = function (act, prop) {
  if (act == 'prop') {
    for (let v in this.mod.device.dictionary.data) {
      if (v == prop) {
        return this.mod.device.dictionary.data[v];
      }
    }
  } else if (act == 'name') {
    console.error('not define');
  }
};

formatType.GetRoadPropName = function (prop) {
  for (let v in this.mod.road.dictionary.type) {
    if (this.mod.road.dictionary.type[v].prop == prop) {
      return this.mod.road.dictionary.type[v].name;
    }
  }
  return '';
}

formatType.GetDeviceIcon = function (mod, payload) {

  let src = '/images/deviceIcon/';
  let suffix = '.svg';
  if (payload) {
    src = src + mod + '-' + payload + suffix;
  } else {
    src = src + mod + suffix;
  }
  return src
}
export default formatType;
