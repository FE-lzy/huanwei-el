
import _func from '@/func/main';
import _plugin from './../plugin';
import _getpath from './getpath';
import _buildpoint from './pointitem';

let id = 1;
class roaditem {
  roadtype = ''; // default back
  type = ''; // total start base
  show = '';
  path = [];
  mapprogram = null;
  program = null;
  dragprogram = null;
  data = {
    current: new _buildpoint(),
    start: null,
    end: null
  };
  size = 0;
  timer = {
    current: ''
  };
  callback = {

  };
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata).then(res => { }, res => { });
    }
    this.id = id;
    id++;
  }
  GetPath(type = 'array') {
    if (type == 'array') {
      let list = [];
      for (let i = 0; i < this.path.length; i++) {
        list.push([this.path[i].lng, this.path[i].lat]);
      }
      return list;
    } else if (type == 'string') {
      let list = [];
      for (let i = 0; i < this.path.length; i++) {
        list.push(this.path[i].lng + ',' + this.path[i].lat);
      }
      return list;
    }
  }
  GetPointName(point) {
    if (this.data.start == point) {
      return 'start';
    } else if (this.data.end == point) {
      return 'end';
    } else {
      return false;
    }
  }
  SetOpttions(type, roadtype, map) {
    this.type = type;
    this.roadtype = roadtype;
    this.mapprogram = map;
  }
  // 加载
  FuncInit({ start, end, type, roadtype = 'default', map, path, show = 'show', fix, callback }) {
    return new Promise((resolve, reject) => {
      this.FuncShow('set', show);
      this.SetOpttions(type, roadtype, map);
      this.SetPoint(start, end);
      if (callback) {
        this.FuncCallback('set', callback);
      }
      this.BuildRoad(fix, path).then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    });
  }
  FuncSize(act) {
    if (act == 'synchro') {
      this.size = this.program.getLength();
    } else if (act == 'get') {
      return this.size;
    }
  }
  SetPoint(start, end) {
    this.data.start = start;
    this.data.end = end;
  }
  FuncReType(type) {
    this.type = type;
  }
  PointCallback(data) {
    data.roaditem = this;
    this.FuncCallback('trigger', data);
  }
  FuncShow(act, data) {
    if (act == 'set') {
      this.show = data;
    } else if (act == 'synchro') { // 根据当前显示值进行显示隐藏的同步操作
      if (this.show) {
        if (!this.load) {
          this.FuncBuild();
        }
        this.FuncAct('show');
      } else {
        this.FuncAct('hide');
      }
    }
  }
  /* 因为路线的检索有可能会出现起始点并不在真正设置的点处，因此，这里需要进行判断，在起始点处时，对应的点会根据path调整位置
  其他的路线中，没条线段的开始点都固定选取上一条线路的终点固定为开始点，而终点则依然根据path自适应
  因此这里需要对路线点的位置进行微调，是的路线之间无缝连接
  */
  ResetPath(path, fix, act) {
    this.path = path;
    if (!act) {
      this.data.start.SetLnglat(path[0].lng, path[0].lat, 'move');
      this.data.end.SetLnglat(path[path.length - 1].lng, path[path.length - 1].lat, 'move');
    }
  }
  FuncReBuild(fix) {
    return new Promise((resolve, reject) => {
      this.BuildRoad(fix).then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    });
  }
  InitPath(fix, path) {
    return new Promise((resolve, reject) => {
      if (!path) {
        _getpath.GetData(this.data.start.GetLnglat(), this.data.end.GetLnglat()).then(res => {
          this.ResetPath(res.path, fix);
          resolve(res);
        }, res => {
          reject(res);
        });
      } else {
        this.ResetPath(path, fix, 'set');
        resolve({ status: 'success' });
      }
    });
  }
  BuildRoad(fix, path) {
    return new Promise((resolve, reject) => {
      let act = 'init';
      if (this.program) {
        act = 'reset';
      }
      this.InitPath(fix, path).then(res => {
        if (act == 'reset') {
          this.FuncAct('reset');
        }
        let options = {
          path: this.path,
          strokeWeight: 5,
          strokeColor: this.roadtype == 'default' ? 'rgba(19,115, 204, 0.8 )' : 'rgba(201, 24, 24,0.8)',
          zIndex: this.roadtype == 'default' ? 100 : 99,
          isOutline: false,
          lineJoin: 'round' // 折线拐点连接处样式
        };
        let dragoptions = {
          path: this.path,
          strokeWeight: 14,
          strokeColor: 'rgba(0, 0, 0, 0)',
          zIndex: this.roadtype == 'default' ? 110 : 109,
          isOutline: false,
          lineJoin: 'round' // 折线拐点连接处样式
        };
        this.program = _plugin.FuncMod('line', {
          options: options,
          map: this.mapprogram
        });
        this.FuncSize('synchro');
        this.dragprogram = _plugin.FuncMod('line', {
          options: dragoptions,
          map: this.mapprogram
        });
        this.dragprogram.on('mouseover', (e) => {
          this.FuncCurrent('show', [e.lnglat.lng, e.lnglat.lat]);
        });
        this.dragprogram.on('mouseout', (e) => {
          this.FuncCurrent('hide');
        });
        if (this.show != 'show') {
          this.FuncAct('hide');
        }
        resolve(res);
      }, res => {
        reject(res);
      });
    });
  }
  FuncCurrent(act, data) {
    if (act == 'show') {
      if (!this.data.current.load) {
        this.FuncCurrent('init', data)
      } else {
        this.data.current.FuncAct('move', data);
        this.data.current.FuncAct('show');
      }
    } else if (act == 'init') {
      this.data.current = new _buildpoint({
        roadtype: this.roadtype,
        map: this.mapprogram,
        type: 'base',
        lng: data[0],
        lat: data[1],
        extdata: {
          maintype: 'current'
        },
        callback: {
          name: 'maincallback',
          func: (data) => {
            this.FuncCallback('trigger', data);
          }
        }
      });
    } else if (act == 'hide') {
      this.data.current.FuncAct('hide');
    }
  }
  FuncCallback(act, data) {
    if (act == 'set') {
      this.callback[data.name] = data.func;
    } else if (act == 'trigger') {
      for (let v in this.callback) {
        this.callback[v](data);
      }
    }
  }
  FuncAct(act) {
    if (act == 'reset') {
      if (this.program) {
        this.program.setMap(null);
        this.program = null;
      }
      if (this.dragprogram) {
        this.dragprogram.setMap(null);
        this.dragprogram = null;
      }
    } else if (act == 'destroy') {
      if (this.program) {
        this.program.setMap(null);
        this.program = null;
      }
      if (this.dragprogram) {
        this.dragprogram.setMap(null);
        this.dragprogram = null;
      }
      this.data.current.FuncAct('destroy');
      this.show = '';
    } else if (act == 'hide') {
      if (this.program) {
        this.program.hide();
      }
      if (this.dragprogram) {
        this.dragprogram.hide();
      }
      this.data.current.FuncAct('hide');
      this.show = 'hide';
    } else if (act == 'show') {
      if (this.program) {
        this.program.show();
      }
      if (this.dragprogram) {
        this.dragprogram.show();
      }
      this.show = 'show';
    }
  }

}

export default roaditem;