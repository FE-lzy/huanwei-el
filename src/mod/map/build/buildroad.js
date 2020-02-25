import _func from '@/func/main';
import _getpath from './getpath';
import _pathitem from './pathitem';
import _roaditem from './roaditem';
import _pointitem from './pointitem';

/**
 * @description 道路创建
 * 操作如下
 * click 1 创建 start
 * click 2 创建 end
 * start 拖拽更改
 * end 拖拽更改
 * 中间拖拽 当前路径开始+中间 中间+结束形成2个新的路径
 * 路径的函数是多选的
 * 路径需要删除功能实现替换
 * 考虑完成后的数据重置工作
 */
class buildroad {
  load = '';
  status = ''; // multiple
  mapfunc = null;
  current = {
    num: 0,
    program: new _pointitem(),
    start: new _pointitem(),
    end: new _pointitem()
  };
  size = {
    total: 0,
    default: 0,
    back: 0
  };
  road = {
    default: new _pathitem(),
    back: new _pathitem('back', 'hide')
  };
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata);
    }
  }
  ReInitData(startpoint, endpoint, originpath) {
    this.FuncPointAct('add', startpoint, 'wait');
    this.FuncPointAct('add', endpoint, 'wait');
    let path = {
      default: []
    };
    for (let i = 0; i < originpath.default.length; i++) {
      path.default.push(originpath.default[i].position);
    }
    if (originpath.back) {
      path.back = [];
      for (let n = 0; n < originpath.back.length; n++) {
        path.back.push(originpath.back[n].position);
      }
    }
    this.ReInitRoad(path);
  }
  ReInitRoad(path) {
    let defaultpoint = this.road.default.GetBuildPoint();
    let backpoint = this.road.back.GetBuildPoint();
    this.BuildRoaditem(defaultpoint.start, defaultpoint.end, 'total', 'default', path.default).then(res => {
      this.road.default.PushData('road', res.item);
      this.FuncSize('recount', 'default');
    }, res => {});
    this.BuildRoaditem(backpoint.end, backpoint.start, 'total', 'back', path.back).then(res => {
      this.road.back.PushData('road', res.item);
      this.FuncSize('recount', 'back');
    }, res => {});
  }
  FuncAct(act) {
    if (act == 'reset') {
      this.road.default.FuncAct('total', 'destroy');
      this.road.back.FuncAct('total', 'destroy');
    }
  }
  GetPath() {
    let path = [];
    let defaultroad = this.road.default.GetPathByShow();
    let backroad = this.road.back.GetPathByShow();
    path.push(defaultroad.join(';'));
    if (backroad) {
      path.push(backroad.join(';'));
    }
    return path;
  }
  SetType(type) {
    if (type == 'double') {
      this.road.back.FuncAct('road', 'show');
      this.road.back.FuncAct('point', 'show');
    } else {
      this.road.back.FuncAct('road', 'hide');
      this.road.back.FuncAct('point', 'hide');
    }
    this.FuncSize('synchro');
  }
  // 该函数会在创建和调整的时候调用，在创建的时候进行判断
  FuncInit({ status = 'single', show = 'show', pathoptions = {}}) {
    this.SetOpttions(status, show);
    _getpath.FuncInit(pathoptions);
    this.load = 'success';
  }
  SetOpttions(status, show) {
    this.status = status;
    this.SetShow(show);
  }
  SetShow(data) {
    this.show = data;
  }
  SetMapFunc(mapfunc) {
    this.mapfunc = mapfunc;
    this.road.default.SetMapFunc(mapfunc);
    this.road.back.SetMapFunc(mapfunc);
  }
  BuildPointitem(roadtype, lng, lat) {
    let newpoint = new _pointitem({
      map: this.mapfunc.GetProgram(),
      roadtype: roadtype,
      lng: lng,
      lat: lat,
      hide: this.road[roadtype].GetShow() == 'hide',
      extdata: {
        maintype: 'main'
      },
      callback: {
        name: 'maincallback',
        func: (data) => {
          this.FuncPointCallback(data);
        }
      }
    });
    return newpoint;
  }
  FuncPointAct(act, data, next) {
    if (act == 'add') {
      let target = 'add';
      if (this.road.default.GetList('point').length == 0) {
        target = 'start';
      } else if (this.road.default.GetList('point').length == 1) {
        target = 'end';
      }
      let defaultpoint = this.BuildPointitem('default', data.lng, data.lat);
      this.FuncResetCurrent(defaultpoint);
      this.road.default.PushData('point', defaultpoint);
      let backpoint = this.BuildPointitem('back', data.lng, data.lat);
      this.road.back.PushData('point', backpoint);
      if (target == 'start') {
        this.FuncResetCurrent(defaultpoint, 'start');
      } else if (target == 'end') {
        this.FuncResetCurrent(defaultpoint, 'end');
        if (next != 'wait') {
          this.FuncRoadAct('build');
        }
      } else if (target == 'add') {
        this.FuncResetCurrent(defaultpoint, 'end');
        if (next != 'wait') {
          this.FuncRoadAct('add');
        }
      }
    } else if (act == 'current') {
      if (this.current.num > 0) {
        this.current.program.SetLnglat(data.lng, data.lat, 'move');
        this.FuncPointCallback({
          event: 'dragend',
          pointitem: this.current.program
        })
      } else {
        this.FuncPointAct('add', data);
      }
    }
  }
  GetPoint(act) {
    if (act == 'start') {
      return this.data.point.GetList()[0];
    } else if (act == 'end') {
      return this.data.point.GetList()[this.data.point.GetList().length - 1];
    }
  }
  FuncResetCurrent(target, prop = 'program') {
    this.current[prop] = null;
    this.current[prop] = target;
    this.current.num++;
    this.road.default.SetCurrentPoint(target);
    this.road.back.SetCurrentPoint(target);
  }
  BuildRoaditem(start, end, type, roadtype = 'default', path) {
    return new Promise((resolve, reject) => {
      let roaditem = new _roaditem();
      roaditem.FuncInit({
        start: start,
        end: end,
        show: this.road[roadtype].GetShow(),
        map: this.mapfunc.GetProgram(),
        type: type,
        roadtype: roadtype,
        path: path,
        callback: {
          name: 'inroadcallback',
          func: (data) => {
            this.FuncRoadCallback(roadtype, roaditem, data)
          }
        }
      }).then(res => {
        resolve({ status: 'success', item: roaditem })
      }, res => {});
    });
  }
  FuncRoadAct(act, path) {
    let defaultpoint = this.road.default.GetBuildPoint();
    let backpoint = this.road.back.GetBuildPoint();
    if (act == 'build') {
      this.BuildRoaditem(defaultpoint.start, defaultpoint.end, 'total').then(res => {
        this.road.default.PushData('road', res.item);
        this.FuncSize('recount', 'default');
      }, res => {});
      this.BuildRoaditem(backpoint.end, backpoint.start, 'total', 'back').then(res => {
        this.road.back.PushData('road', res.item);
        this.FuncSize('recount', 'back');
      }, res => {});
    } else if (act == 'add') {
      let endroad = this.road.default.GetEnd('road');
      if (endroad.type == 'total') {
        endroad.FuncReType('start');
      } else {
        endroad.FuncReType('base');
      }
      this.BuildRoaditem(defaultpoint.start, defaultpoint.end, 'end').then(res => {
        this.road.default.PushData('road', res.item);
        this.FuncSize('recount', 'default');
      }, res => {});

      let startroad = this.road.back.GetStart('road');
      if (startroad.type == 'total') {
        startroad.FuncReType('end');
      } else {
        startroad.FuncReType('base');
      }
      this.BuildRoaditem(backpoint.end, backpoint.start, 'start', 'back').then(res => {
        this.road.back.PushData('road', res.item);
        this.FuncSize('recount', 'back');
      }, res => {});
    }
  }
  FuncSize(act, data) {
    if (act == 'synchro') {
      let backshow = this.road.back.GetShow();
      if (backshow == 'hide') {
        this.size.total = _func.getnum(this.size.default);
      } else {
        this.size.total = _func.getnum(this.size.default + this.size.back);
      }
    } else if (act == 'recount') {
      this.size[data] = this.road[data].ReGetSize();
      this.FuncSize('synchro');
    }
  }
  FuncRoadCallback(roadtype, roaditem, data) {
    if (data.event == 'dragend') {
      let currentpoint = data.pointitem;
      this.ReplaceRoaditem(roadtype, roaditem, currentpoint);
    }
  }
  ReplaceRoaditem(roadtype, roaditem, currentpoint) {
    let pathitem = this.road[roadtype];
    let pointitemposition = currentpoint.GetLnglat();
    let newpoint = this.BuildPointitem(roadtype, pointitemposition[0], pointitemposition[1]);
    let startpoint = roaditem.data.start;
    let endpoint = roaditem.data.end;
    let starttype = 'base';
    let endtype = 'base';
    if (roaditem.type == 'total') {
      starttype = 'start';
      endtype = 'end';
    } else if (roaditem.type == 'start') {
      starttype = 'start';
    } else if (roaditem.type == 'end') {
      endtype = 'end';
    }
    // start, end, type, roadtype = 'default'
    this.BuildRoaditem(startpoint, newpoint, starttype, roadtype).then(res => {
      let startitem = res.item;
      this.BuildRoaditem(startitem.data.end, endpoint, endtype, roadtype).then(res => {
        let enditem = res.item;
        pathitem.ReplaceRoad(roaditem, [startitem, enditem]);
        pathitem.ReplacePoint(newpoint, roadtype == 'default' ? endpoint : startpoint);
        this.FuncSize('recount', roadtype);
        roaditem.FuncAct('destroy');
      }, res => {});
    }, res => {});
  }
  FuncPointCallback(data) {
    let pointitem = data.pointitem;
    if (data.event == 'dragend') {
      let roadtype = pointitem.roadtype;
      this.ReRoadByPoint(roadtype, pointitem);
    } else if (data.event == 'current') {
      this.FuncResetCurrent(pointitem);
    }
  }
  ReRoadByPoint(roadtype, pointitem) {
    let pathitem = this.road[roadtype];
    let roadtemp = pathitem.GetRoadByPoint(pointitem);
    this.ReRoadDo(roadtemp.start).then(res => {
      this.ReRoadDo(roadtemp.end).then(res => {
        this.FuncSize('recount', roadtype);
      }, res => {
      });
    }, res => {
    });
  }
  ReRoadDo(roaditem, fix) {
    return new Promise((resolve, reject) => {
      if (roaditem) {
        roaditem.FuncReBuild(fix).then(res => {
          resolve(res);
        }, res => {
          reject(res);
        });
      } else {
        resolve({ status: 'next' })
      }
    });
  }
}

export default buildroad;
