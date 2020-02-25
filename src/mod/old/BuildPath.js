import _func from '@/func/main';

import mainplugin from './../map/plugin';

class BuildNavg {
  program = null;// 巡航器实例
  data = {
    lastcurrent: 'stop',
    current: 'stop', // 当前状态
    mainsize: false, // 总长度
    listlength: false, // 总点数
    percent: 0 // 当前进度
  };
  operate = {
    limit: false
  };
  action = {
    last: 'stop'// 最后的状态
  };
  speed = {
    base: 1, // 速度基准值
    num: 1// 速度系数
  };
  /**
   * @param {Object} initdata data {Object} listlength mainsize 长度相关设置
   * @param {Object} initdata speed {Object} base num 速度相关设置
   * @param {Object} initdata program {Object} 轨迹展示实例
   * @param {Object} initdata pathoption {Object} 巡航器样式数据-width height content
   * @param {Object} initdata events {Object} 巡航器绑定事件
   */
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata);
    }
  }
  /**
   * @param {Object} initdata data {Object} listlength mainsize 长度相关设置
   * @param {Object} initdata speed {Object} base num 速度相关设置
   * @param {Object} initdata program {Object} 轨迹展示实例
   * @param {Object} initdata pathoption {Object} 巡航器样式数据-width height content
   * @param {Object} initdata events {Object} 巡航器绑定事件
   */
  FuncInit(initdata) {
    this.data.listlength = initdata.data ? initdata.data.listlength : false;
    this.data.mainsize = initdata.data ? initdata.data.mainsize : false;
    this.speed.base = initdata.speed ? initdata.speed.base : 50;
    this.speed.num = initdata.speed ? initdata.speed.num : 1;
    this.program = mainplugin.BuildPathNav(initdata.program, {
      speed: this.GetSpeed(),
      pathoption: initdata.pathoption
    }, initdata.events);
  }
  GetSpeed() {
    return this.speed.base * this.speed.num;
  }
  /**
   * @description 设置当前状态函数
   */
  SetCurrent(current) {
    // console.log('设置current', current);
    this.data.lastcurrent = this.data.current;
    this.data.current = current;
  }
  /**
   * @description 设置当前状态函数
   */
  GetCurrent(prop = 'current') {
    return this.data[prop];
  }
  /**
   * @description 速度调节函数
   */
  FuncSpeed(act) {
    if (act == 'up') {
      this.speed.num = this.speed.num * 2;
    } else if (act == 'down') {
      if (this.speed.num > 1) {
        this.speed.num = this.speed.num / 2;
      }
    }
    this.program.setSpeed(this.GetSpeed());
  }
  FuncSetSpeed(num) {
    this.speed.num = num;
    this.program.setSpeed(this.GetSpeed());
  }
  /**
   * @description 通过点跳转函数
   */
  MoveToPoint(num, tail) {
    if (this.program) {
      this.program.moveToPoint(num, tail);
    }
  }
  /**
   * @description 设置进度函数
   */
  SetPercent(type) {
    if (type == 'distance') {
      this.data.percent = _func.getnum(this.GetMoveSize() / this.data.mainsize * 100, 'round', 1);
    }
  }
  /**
   * @description 获取进度函数
   */
  GetPercent() {
    return this.data.percent;
  }
  ReStart(act) {
    if (act == 'auto') {
      if (this.data.percent >= 100) {
        // this.MoveToPoint(0, 0);
        // this.data.percent = 0;
        this.SetCurrent('stop');
      }
    }
  }
  /**
   * @description 巡航器自身函数
   */
  FuncAct(act, resart) {
    console.log(act, resart);
    if (this.program) {
      if (act == 'resume') {
        if (this.GetPercent() == 100) {
          act = 'start';
        }
        // console.log('last current is ' + this.GetCurrent('lastcurrent'));
      }
      this.program[act]();
    }
  }
  /**
   * @description 设置巡航器状态函数
   */
  SetLastAction() {
    this.action.last = this.program.getNaviStatus();
  }
  /**
   * @description 获取巡航器状态函数
   */
  GetLastAction() {
    return this.action.last;
  }
  /**
   * @description ？
   */
  FuncByLastAction() {
    if (this.GetLastAction() == 'moving') {
      // this.FuncAct('resume');
    }
  }
  /**
   * @description 超过自动停止函数
   */
  SetStopByPercent() {
    if (this.data.percent >= 100) {
      this.FuncAct('pause');
    }
  }
  SetOperate(prop, data) {
    this.operate[prop] = data;
  }
  GetOperate(prop) {
    return this.operate[prop];
  }
  /**
   * @description 巡航器根据百分比进度设置位置
   */
  MoveToPercent(num, act) {
    if (this.program) {
      // console.log(`limit:${this.GetOperate('limit')},${num},${act}`);
      if (act == 'set') {
        if (!this.GetOperate('limit')) {
          this.SetLastAction();
          this.SetOperate('limit', true);
        }
      } else if (act == 'get') {
        this.SetOperate('limit', false);
      }
      let n = num / 100 * this.data.mainsize;
      this.MoveByDistance('distance', n);
      if (act == 'get') {
        console.log('恢复状态: ' + this.GetLastAction());
        if (this.GetLastAction() == 'moving') {
          this.FuncAct('resume');
        }
      }
    }
  }
  /**
   * @description 获取巡航器移动距离
   */
  GetMoveSize() {
    return this.program.getMovedDistance();
  }
  /**
   * @description 根据相对距离移动巡航器
   */
  MoveByDistance(type, data) {
    if (this.program) {
      if (type == 'distance') {
        let lastdata = data - this.GetMoveSize();
        if (lastdata < 0) {
          this.FuncAct('stop');
          this.FuncAct('start');
          this.program.moveByDistance(data);
        } else {
          this.program.moveByDistance(lastdata);
        }
        if (this.GetOperate('limit')) {
          this.FuncAct('pause');
        }
      }
    }
  }
  /**
   * @description 获取巡航器当前点的索引
   */
  GetIndex() {
    if (this.program) {
      return this.program.getCursor();
    } else {
      return false;
    }
  }
  /**
   * @description 获取巡航器当前经纬度
   */
  GetPosition() {
    if (this.program) {
      return this.program.getPosition();
    } else {
      return false;
    }
  }
  /**
   * @description 销毁巡航器实例
   */
  FuncDestroy() {
    if (this.program) {
      this.program.destroy();
    }
  }
}

class BuildPath {
  load = false;// 加载判断值
  program = null;// 实例
  mapprogram = null;// 地图实例
  navg = new BuildNavg();// 巡航器实例
  data = {
    listlength: false, // 点数
    size: false, // 点数组长度
    list: [] // 点数组
  }
  /**
   * @param {Object} initdata mapprogram {Object} 地图实例
   * @param {Object} initdata options {Object} 轨迹展示选项opt数据
   * @param {Object} initdata navg {Object} 轨迹展示巡航器相关设置数据
   */
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata);
    }
  }
  /**
   * @param {Object} initdata mapprogram {Object} 地图实例
   * @param {Object} initdata listlength {Number} 点阵数量
   * @param {Object} initdata list {Array} 轨迹点数组
   */
  SetData({ mapprogram, data, list }) {
    this.mapprogram = mapprogram;
    this.data.listlength = data.listlength;
    this.data.list = list;
  }
  ResetNavgFunc() {
    this.navg.FuncDestroy();
    this.navg = new BuildNavg();
  }
  FuncDestroy() {
    this.navg.FuncDestroy();
    // 销毁所有巡航
    // this.program.clearPathNavigators();
    this.program = null;
  }
  /**
   * @param {Object} initdata mapprogram {Object} 地图实例
   * @param {Object} initdata list {Array} 轨迹展示路径数据
   * @param {Object} initdata options {Object} 轨迹展示选项opt数据
   * @param {Object} initdata navg {Object} 轨迹展示巡航器相关设置数据
   */
  FuncInit(initdata) {
    let self = this;
    return new Promise(function (resolve, reject) {
      self.SetData(initdata);
      if (!self.program) {
        mainplugin.FuncPlugin('path', {
          data: initdata.list,
          options: initdata.options
        }).then(function (Res) {
          if (Res.status == 'success') {
            self.program = Res.func;
            self.GetMainSize();
            self.SetNavgFunc(initdata.navg);
            resolve(Res);
          } else {
            reject(Res);
          }
        });
      } else {
        self.ResetNavgFunc();
        self.program.setData(initdata.list);
        self.GetMainSize();
        self.SetNavgFunc(initdata.navg);
        resolve({ status: 'success' });
      }
    });
  }

  /**
   * @description 设置巡航器
   */
  SetNavgFunc(navginitdata) {
    let self = this;
    this.navg.FuncInit({
      program: this.program,
      pathoption: {
        width: navginitdata.options.width,
        height: navginitdata.options.height,
        // 使用图片
        content: mainplugin.data.path.program.Render.Canvas.getImageContent(navginitdata.options.icon, function () {
          // 图片加载成功，重新绘制一次
          self.program.renderLater();
        }, function onerror(e) {
          alert('图片加载失败！');
        })
      },
      events: {
        'start': function () {
          self.navg.SetCurrent('start');
        },
        'resume': function () {
          self.navg.SetCurrent('resume');
        },
        'stop': function () {
          self.navg.SetCurrent('stop');
          // self.navg.ReStart('auto');
        },
        'pause': function () {
          self.navg.SetCurrent('pause');
        },
        'move': function (movedata, pathdata) {
          self.navg.SetCurrent('move');
          self.navg.SetPercent('distance');
          if (navginitdata.events && navginitdata.events['move']) {
            navginitdata.events['move'](movedata, pathdata);
          }
          self.navg.SetStopByPercent();
        }
      },
      data: {
        mainsize: self.data.size,
        listlength: self.data.listlength
      },
      speed: {
        base: navginitdata.speed.base,
        num: navginitdata.speed.num
      }
    });
  }

  /**
   * @param {String} act navg act
   */
  FuncNavg(act) {
    this.navg.FuncAct(act);
  }
  /**
   * @description 获取当前轨迹展示的总距离
   */
  GetMainSize() {
    let cachenavg = new BuildNavg({
      program: this.program,
      pathoption: {
        width: 0,
        height: 0
      }
    });
    cachenavg.MoveToPoint(this.data.list[0].path.length - 1);
    this.data.size = cachenavg.GetMoveSize();
    cachenavg.FuncDestroy();
  }
}

export default BuildPath;
