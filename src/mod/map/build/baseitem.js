
import _func from '@/func/main';
import _plugin from '../plugin';
import _itemgroup from './itemgroup';
import _events from './events';
const config = {
  scalearr: [
    0.0, 0.0, 0.0, 0.1, 0.1,
    0.2, 0.2, 0.2, 0.3, 0.3,
    0.4, 0.5, 0.6, 0.7, 0.8,
    0.9, 1.0, 1.1, 1.2, 1.3
  ]
};

/*
events 事件基本定义

*/
class baseitem {
  load = {
    base: {
      data: '',
      program: ''
    }
  };
  type = { // 更新加载模式=> base 基本数据和详情数据分离,详情数据不影响地图显示 total 基本数据详情数据合并,更新接口仅仅变量更新
    data: 'base', // total
    prop: { // 更新的判断相同对象的判断值
      type: 'base', // base 属性
      data: 'id'
    }
  };
  mod = {
    type: 'base',
    name: ''
  };
  status = {
    show: false, // 地图显示判断值
    type: 'default' // ?
  };
  mapfunc = null; // 地图实例
  program = new _itemgroup([]); // 聚合物集合实例
  events = new _events({
    mod: { // 事件判断
    },
    list: ['BeforeInit', 'Initing', 'Inited', 'BeforeBuild', 'Building', 'Builded', 'BeforeUpdate', 'Updating', 'Updated', 'click', 'actshow', 'acthide', 'actdestroy']
  });
  data = {}; // 外部定义数据存档
  list = [];
  next = {// 定时器设置，更新需要的
    func: '',
    start: 10000,
    time: 10000
  };
  constructor({ name, type, data = {}, next, events, methods }) {
    this.mod.name = name;
    this.data = data;
    this.FuncTypeByAct('set', type);
    this.FuncNextByAct('set', next);
    this.FuncEventsByAct('set', events);
    for (let funct in methods) {
      this[funct] = methods[funct];
    }
  }
  FuncInit(force) {
    return new Promise((resolve, reject) => {
      if (!this.FuncLoadByAct('get', 'base', 'data') || force) {
        this.FuncEventsByAct('trigger', {
          name: 'BeforeInit'
        });
        this.FuncLoadByAct('set', 'base', 'data', 'loading');
        this.list = [];
        this.LoadData('init').then(res => {
          this.list = res.list;
          this.FuncLoadByAct('set', 'base', 'data', 'success');
          this.FuncEventsByAct('trigger', {
            name: 'Inited'
          });
          resolve(res);
        }, res => {
          this.FuncLoadByAct('set', 'base', 'data', '');
          reject(res);
        });
      } else if (this.FuncLoadByAct('get', 'base', 'data') == 'success') {
        // this.ReBuild();
        resolve({
          status: this.FuncLoadByAct('get', 'base', 'data')
        });
      } else {
        resolve({
          status: this.FuncLoadByAct('get', 'base', 'data')
        });
      }
    });
  }
  GetFormatData() {
    return {
      load: {
        base: '',
        detail: ''
      },
      data: {
        base: {},
        detail: {}
      },
      program: {
        main: null,
        popup: null
      }
    };
  }
  /**
   * @description 格式化数组，调用外部定义的Formatdata方法格式化数据
   * 返回的数据格式中
   * load 是加载状态判断值
   * data 是基础以及详细数据的存放处
   * program 是对应地图实例的挂载处
   */
  FuncFormatList(act, reslist) {
    let list = [];
    for (let i = 0; i < reslist.length; i++) {
      let item = this.GetFormatData();
      this.FuncFormatData(act, item, reslist[i]);
      item.load.base = 'success';
      // total 状态下init时加载全部数据，因此detail设置未success，update状态下跟原来的数据保持一致，避免新加数据被误认为详情数据已经拉取成功
      if (act == 'init' && this.FuncTypeByAct('get') == 'total') {
        item.load.detail = 'success';
      }
      list.push(item);
    }
    return list;
  }
  /**
   * @description 创建基本数据
   * @param {String} act 加载或者更新，加载额时候直接进行数据实例判断并创建实例，更新则创建完成后添加到基本数据数组中
   * @param {Array} updatelist 需要更新的数据
   */
  FuncBuildByAct(act, buildlist) {
    if (act == 'init') {
      this.FuncEventsByAct('trigger', {
        name: 'BeforeBuild'
      });
      for (let i = 0; i < buildlist.length; i++) {
        this.FuncPreBuild(act, buildlist[i]);
      }
      this.FuncLoadByAct('set', 'base', 'program', 'success');
      this.FuncEventsByAct('trigger', {
        name: 'Builded'
      });
      this.FuncNextByAct('do', this.next.start);
    } else if (act == 'update') {
      for (let i = 0; i < buildlist.length; i++) {
        this.FuncPreBuild(act, buildlist[i]);
        this.FuncPushItem(buildlist[i]);
      }
      this.FuncNextByAct('do', this.next.time);
    }
  }
  FuncPushItem(item) {
    this.list.push(item);
  }
  FuncPreBuild(act, itemdata) {
    if (this.FuncTypeByAct('get') == 'base') {
      this.FuncBuild(itemdata);
    } else if (this.FuncTypeByAct('get') == 'total') {
      if (itemdata.load.detail == 'success') {
        this.FuncBuild(itemdata);
      } else {
        this.LoadDetailData(itemdata).then(res => {
          this.FuncBuild(itemdata);
        }, res => {
          console.log(res);
        });
      }
    }
  }
  // 更新函数
  FuncDoUpdate() {
    return new Promise((resolve, reject) => {
      // 更新数据
      this.FuncEventsByAct('trigger', {
        name: 'BeforeUpdate'
      });
      if (this.FuncTypeByAct('get') == 'base') {
        this.LoadData('update').then(res => {
          this.FuncCheckUpdate(res.list);
          resolve(res);
        }, res => {
          reject(res);
        });
      } else if (this.FuncTypeByAct('get') == 'total') {
        this.LoadUpdateData('update').then(res => {
          this.FuncCheckUpdate(res.list);
          resolve(res);
        }, res => {
          reject(res);
        });
      }
    });
  }
  FuncCheckUpdate(newlist) {
    for (let n = 0; n < this.list.length; n++) {
      let itemdata = this.list[n];
      for (let i = 0; i < newlist.length; i++) {
        if (this.type.prop.type == 'base') {
          if (newlist[i].data.base[this.type.prop.data] == itemdata.data.base[this.type.prop.data]) {
            this.FuncUpdateItem(itemdata, newlist[i]);
            newlist.splice(i, 1);
            break;
          }
        }
      }
    }
    this.FuncEventsByAct('trigger', {
      name: 'Updated',
      data: {
        offsetlist: newlist
      }
    });
    // 此时newlist如果存在数据则说明该数据为新数据，添加到基本数据数组中去
    this.FuncBuildByAct('update', newlist);
  }
  FuncSetCurrent(itemdata) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i] != itemdata) {
        this.list[i].data.base.current = false;
      } else {
        itemdata.data.base.current = true;
      }
    }
  }
  FuncUpdateItem(itemdata, newdata) {
    this.FuncEventsByAct('trigger', {
      name: 'Updating',
      data: {
        itemdata: itemdata,
        newdata: newdata
      }
    });
    let typeact = this.FuncTypeByAct('get');
    if (typeact == 'base') {
      // 更新数据
      newdata.data.base.current = itemdata.data.base.current;
      itemdata.data.base = newdata.data.base;
      // 存在base说明已加载实例，此时需要做的是更新实例位置以及对于的详情操作
      if (itemdata.program.main) {
        itemdata.program.main.setExtData(itemdata);
        this.FuncUpdate(itemdata);
        this.FuncPopup(itemdata);
      } else {
        // 不存在的时候如更新数据存在定位点则创建实例
        this.FuncBuild(itemdata);
      }
    } else if (typeact == 'total') {
      // 差异化更新操作
      this.FuncUpdateItemNext(itemdata, newdata);
      if (itemdata.program.main) {
        itemdata.program.main.setExtData(itemdata);
        this.FuncUpdate(itemdata);
        this.FuncPopup(itemdata);
      } else {
        // 不存在的时候如更新数据存在定位点则创建实例
        this.FuncBuild(itemdata);
      }
    }
  }
  FuncPopup(itemdata,) {
    if (this.GetEventAct('popup')) {
      let popupload = this.GetPopupStatus('load', itemdata);
      let popupcurrent = this.GetPopupStatus('current', itemdata);
      if (popupload == 'success') {
        if (this.FuncTypeByAct('get') == 'base') {
          itemdata.load.popup = 'needload';
        }
        if (popupcurrent == 'open') {
          next.call(this, itemdata);
        }
      } else if (popupload == 'needload') {
        if (popupcurrent == 'open') {
          next.call(this, itemdata);
        }
      }
    }
    function next (itemdata) {
      this.FuncPopupAct('move', itemdata);
      this.FuncPopupByAct('update', itemdata).then(res => {
      }, res => {
      });
    }
  }
  // 获取详情框的当前状态
  GetPopupStatus(type, itemdata) {
    if (type == 'load') {
      return itemdata.load.popup;
    } else if (type == 'current') {
      if (itemdata.load.popup == 'success' || itemdata.load.popup == 'needload') {
        let isopen = itemdata.program.popup.getIsOpen();
        if (isopen) {
          return 'open';
        } else {
          return 'close';
        }
      } else if (itemdata.load.popup == 'loading') {
        return 'loading';
      } else {
        return 'unload';
      }
    }
  }
  // 创建详情框
  FuncBuildPopup(itemdata) {
    itemdata.program.popup = _plugin.FuncMod('popup', {
      options: this.FuncOptionsToPopup(itemdata)
    });
  }
  // 根据当前详情框的状态，加载/显示/隐藏/更新操作
  SetPopupFunc(itemdata) {
    let popupcurrent = this.GetPopupStatus('current', itemdata);
    let popupload = this.GetPopupStatus('load', itemdata);
    if (popupload == 'loading') {
      return;
    }
    if (popupcurrent == 'open') {
      this.FuncPopupAct('close', itemdata);
    } else if (popupcurrent == 'close') {
      if (popupload == 'needload') {
        this.FuncPopupByAct('update', itemdata).then(res => {                                                                                                                                                                                                                                                             
          this.FuncPopupAct('open', itemdata);
          this.FuncPopupAct('move', itemdata);
        }, res => {
          console.log(res);
        });
      } else { // success
        this.FuncPopupAct('open', itemdata);
      }
    } else if (popupcurrent == 'unload') {
      this.FuncPopupByAct('init', itemdata).then(res => {
        this.FuncPopupAct('open', itemdata);
      }, res => {
        console.log(res);
      });
    } else if (popupcurrent == 'loading') {
      //
    }
  }
  // 详情框的具体操作的额实现
  FuncPopupAct(act, itemdata) {
    if (act == 'open') {
      itemdata.program.popup.open(itemdata.program.main.getMap(), itemdata.program.main.getPosition());
    } else if (act == 'close') {
      itemdata.program.popup.close();
    } else if (act == 'move') {
      itemdata.program.popup.setPosition(itemdata.data.base.position);
    }
  }
  // 加载或者是更新详情框的详细数据
  FuncPopupByAct(act, itemdata) {
    return new Promise((resolve, reject) => {
      let getdetail = true;
      if (act == 'init' && itemdata.load.detail == 'success') {
        getdetail = false;
      }
      if (getdetail) {
        this.LoadDetailData(itemdata).then(res => {
          next.call(this, act, res);
        }, res => {
          itemdata.load.popup = '';
          reject(res);
        });
      } else {
        itemdata.load.popup = 'loading';
        next.call(this, act, { status: 'success' });
      }
      function next (act, res) {
        if (act == 'init') {
          this.FuncBuildPopup(itemdata);
        } else if (act == 'update') {
          this.FuncDomToPopup(act, itemdata);
        }
        itemdata.load.popup = 'success';
        resolve(res);
      }
    });
  }
  // 基本对象的事件函数以及回调设置
  FuncBaseEventByAct(act, itemdata) {
    if (act == 'click') {
      this.FuncEventsByAct('trigger', {
        name: 'click',
        data: {
          act: act,
          itemdata: itemdata
        }
      });
    }
  }
  // 点击列表事件的回调，显示隐藏详情框
  FuncDefaultBaseEventByAct({ act, itemdata }) {
    if (itemdata.program.main) {
      if (this.GetEventAct('popup')) {
        this.FuncToCenter(itemdata);
      }
    } else {
      _func.showmsg('对应车型没有定位数据');
    }
  }
  // 基本实例的事件触发函数
  FuncBindEvents(eventname, mapitemdata) {
    if (eventname == 'click') {
      mapitemdata.on('click', () => {
        this.FuncEventsByAct('trigger', {
          name: 'click',
          data: {
            act: 'click',
            itemdata: mapitemdata.getExtData()
          }
        });
        // this.FuncToCenter(mapitemdata.getExtData());
      });
    }
  }




  // 加载设置
  FuncTypeByAct(act, data) {
    if (act == 'set') {
      if (data) {
        if (data.data) {
          this.type.data = data.data;
        }
        if (data.prop) {
          this.type.prop = data.prop;
        }
      }
    } else if (act == 'get') {
      return this.type.data;
    }
  }
  // 加载设置
  FuncLoadByAct(act, datatype, prop, data) {
    if (act == 'set') {
      this.load[datatype][prop] = data;
    } else if (act == 'get') {
      return this.load[datatype][prop];
    }
  }
  // 设置定时器
  FuncNextByAct(act, data) {
    // console.log(this.mod.name, act, data, this.next.func);
    if (act == 'set') {
      if (data) {
        if (data.start) {
          this.next.start = data.start;
        }
        if (data.time) {
          this.next.time = data.time;
        }
      }
    } else if (act == 'do') {
      if (this.GetEventAct('update')) {
        // 为了避免重复的延时函数，因此新的延时创建前取消之前的创建
        this.FuncNextByAct('stop');
        this.next.func = setTimeout(() => {
          this.FuncDoUpdate();
        }, data);
      }
    } else if (act == 'stop') {
      if (this.next.func) {
        clearTimeout(this.next.func);
        this.next.func = '';
      }
    }
  }
  // 判断是否存在name事件
  GetEventAct(name) {
    return this.events.FuncModAct('get', {
      name: name
    })
  }
  _FuncShowLog(data) {
    // let showfg = 'total';
    let showfg = [];
    // let showfg = ['trash', 'road'];
    if (showfg == 'total') {
      console.log(`${this.mod.name} events is ${data.name}`);
    } else {
      if (showfg.indexOf(this.mod.name) > -1) {
        console.log(`${this.mod.name} events is ${data.name}`);
      }
    }
  }
  // 事件函数
  FuncEventsByAct(act, data) {
    if (act == 'set') {
      this.events.FuncLoad(data);
    } else if (act == 'trigger') {
      this._FuncShowLog(data);
      let list = this.events.FuncItem('get', { name: data.name })
      for (let i = 0; i < list.length; i++) {
        this[list[i]](data.data);
      }
    }
  }
  // 根据index值获取对应的缩放比例
  GetScale(index) {
    if (this.data.scalearr) {
      return this.data.scalearr[index];
    } else {
      return config.scalearr[index];
    }
  }
  // 设置显示的map实例
  SetMapFunc(mapfunc) {
    this.mapfunc = mapfunc;
  }
  // 设置覆盖物数组实例到对应的地图上
  SetMap(mapfunc) {
    if (mapfunc) {
      this.SetMapFunc(mapfunc);
    }
    if (this.mapfunc) {
      this.program.SetMap(this.mapfunc.GetProgram());
      this.status.show = true;
    }
  }
  ResetMap() {
    this.program.FuncAct('hide');
    this.program.SetMap(null);
    this.status.show = false;
  }
  // 地图缩放后的回调函数
  ResetZoom() {
    if (this.GetEventAct('zoom')) {
      this.program.ForEachList((mapitem, index, list) => {
        this.FuncDom('zoom', mapitem);
      });
    }
  }
  // 显示 隐藏 删除 加载
  GetList() {
    return this.list;
  }
  FuncAct(act, payload, hide) {
    if (act == 'init') {
      // 覆盖物加载函数，需要再覆盖物数据加载完成以及地图创建完成后调用，构建实例并根据hide值加载到地图上
      this.SetMapFunc(payload);
      if (this.FuncLoadByAct('get', 'base', 'program') != 'success') {
        this.FuncBuildByAct('init', this.list);
      }
      this.FuncActNext(act, 'before', payload);
      if (this.mapfunc) {
        this.status.show = this.program.SetMap(this.mapfunc.GetProgram(), hide);
      } else {
        this.status.show = false;
      }
      this.FuncActNext(act, 'after', payload);
    } else if (act == 'hide') {
      this.FuncEventsByAct('trigger', {
        name: 'acthide'
      });
      // 隐藏后停止更新事件
      this.FuncNextByAct('stop');
      this.FuncActNext(act, 'before', payload);
      this.program.FuncAct(act);
      for (let i = 0; i < this.list.length; i++) {
        if (this.GetPopupStatus('current', this.list[i]) == 'open') {
          this.FuncPopupAct('close', this.list[i]);
        }
      }
      this.status.show = false;
      this.FuncActNext(act, 'after', payload);
    } else if (act == 'show') {
      this.FuncEventsByAct('trigger', {
        name: 'actshow'
      });
      // 显示后开始更新事件，未避免隐藏过程中的数据长时间未更新的问题，此时延迟设为2秒
      this.FuncNextByAct('do', 2000);
      this.FuncActNext(act, 'before', payload);
      this.program.FuncAct(act);
      this.status.show = true;
      this.FuncActNext(act, 'after', payload);
    } else if (act == 'destroy') {
      this.FuncEventsByAct('trigger', {
        name: 'actdestroy'
      });
      this.FuncActNext(act, 'before', payload);
      this.FuncNextByAct('stop');
      this.program.FuncAct(act);
      this.status.show = false;
      this.FuncActNext(act, 'after', payload);
      this.FuncLoadByAct('set', 'base', 'program', '');
    }
  }
}

export default baseitem;
