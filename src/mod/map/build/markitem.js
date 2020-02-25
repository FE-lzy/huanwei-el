import _plugin from '../plugin';
import _baseitem from './baseitem';
import _collect from './collect';
import _func from '@/func/main';

class markitem extends _baseitem {
  collect = null; // 聚合点实例
  position = {
    target: 'base'
  };
  constructor({ name, type, data = {}, position, next, events, methods }) {
    super({ name, type, data, next, events, methods });
    this.mod.type = 'mark';
    if (position) {
      this.position = position;
    }
    if (this.GetEventAct('collect')) {
      this.collect = new _collect(); // 聚合点实例
      this.events.FuncItem('set', {
        name: 'BeforeBuild',
        type: 'add',
        list: ['FuncCollect']
      })
    }
  }
  // 创建实例
  FuncBuild(itemdata) {
    if (itemdata.data[this.position.target].position) {
      itemdata.program.main = _plugin.FuncMod('marker', {
        options: this.FuncOptions(itemdata)
      });
      itemdata.program.main.setExtData(itemdata);
      if (this.GetEventAct('popup')) {
        this.FuncBindEvents('click', itemdata.program.main);
      }
      this.program.PushData('item', itemdata.program.main);
      if (this.GetEventAct('collect')) {
        this.collect.PushData('item', itemdata.program.main);
      }
    }
  }
  DelItem(itemdata) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].data[this.type.prop.type][this.type.prop.data] == itemdata.data[this.type.prop.type][this.type.prop.data]) {
        if (itemdata.program.main && this.GetEventAct('collect')) {
          this.collect.FuncData('del', [itemdata.program.main]);
        }
        if (itemdata.program.main) {
          this.program.FuncData('del', [itemdata.program.main]);
        }
        this.list.splice(i, 1);
        break;
      }
    }
  }
  FuncCollect() {
    this.collect.FuncInit({
      list: [],
      options: this.FuncOptionsToCollect(),
      map: this.mapfunc.GetProgram()
    });
  }
  FuncUpdate(itemdata) {
    if (this.position.target == 'base') {
      itemdata.program.main.setPosition(itemdata.data[this.position.target].position);
    }
    this.FuncDom('update', itemdata.program.main);
  }
  // 定时器函数，存在update事件则触发定时更新操作
  FuncToCenter(itemdata) {
    this.mapfunc.SetEventAndCallBack('zoomend', 13, '>').then(res => {
      let left = 240;
      let right = 326;
      let top = 60;
      let domwidth = 270;
      let domheight = 400;
      let mapsize = this.mapfunc.GetSize();
      let defaultoffset = {
        x: 0.5,
        y: 0.7
      }
      if (mapsize) {
        let spacex = mapsize.width - left - domwidth - right;
        let spacey = mapsize.height - top - domheight;
        defaultoffset.x = (spacex / 2 + left + domwidth / 2) / mapsize.width;
        defaultoffset.y = (spacey / 2 + top + domheight) / mapsize.height;
      }
      this.mapfunc.SetDo({
        offset: defaultoffset,
        target: {
          position: itemdata.data[this.position.target].position
        }
      });
      this.SetPopupFunc(itemdata);
    });
  }
  // 显示 隐藏 删除 加载
  FuncActNext(act, timing, payload) {
    if (act == 'init') {
      // 
    } else if (act == 'hide') {
      if (timing == 'before') {
        if (this.GetEventAct('collect')) {
          this.collect.FuncAct(act);
        }
      }
    } else if (act == 'show') {
      if (timing == 'after') {
        if (this.GetEventAct('collect')) {
          this.collect.FuncAct(act, this.program.GetList());
        }
      }
    } else if (act == 'destroy') {
      if (timing == 'before') {
        if (this.GetEventAct('collect')) {
          this.collect.FuncAct(act);
        }
      } else if (timing == 'after') {
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].program.main) {
            this.list[i].program.main.setMap(null);
            this.list[i].program.main = null;
          }
        }
      }
    }
  }
}

export default markitem;