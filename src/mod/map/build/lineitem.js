import _plugin from '../plugin';
import _baseitem from './baseitem';
import _listprogram from './listprogram';

class lineitem extends _baseitem {
  constructor({ name, type, data = {}, next, events, methods }) {
    super({ name, type, data, next, events, methods });
    this.mod.type = 'line';
  }
  // 创建实例
  FuncBuild(itemdata, re) {
    this.FuncFormatPath(itemdata);
    for (let i = 0; i < itemdata.data.detail.path.list.length; i++) {
      if (!itemdata.program.main) {
        itemdata.program.main = new _listprogram();
      }
      if (re) {
        // console.log(itemdata.data.detail.path.list[i]);
      }
      itemdata.program.main.PushData(_plugin.FuncMod('line', {
        options: this.FuncOptions(itemdata.data.detail.path.list[i])
      }));
    }
    if (itemdata.program.main) {
      itemdata.program.main.setExtData(itemdata);
      this.program.PushData('list', itemdata.program.main.GetList());
    }
  }
  DelItem(itemdata) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].data[this.type.prop.type][this.type.prop.data] == itemdata.data[this.type.prop.type][this.type.prop.data]) {
        if (itemdata.program.main) {
          this.program.FuncData('del', itemdata.program.main.GetList());
        }
        this.list.splice(i, 1);
        break;
      }
    }
  }
  ReBuild(itemdata) {
    if (itemdata.program.main) {
      this.program.RemoveList(itemdata.program.main.GetList());
      itemdata.program.main.ReList();
      this.FuncBuild(itemdata, 're');
    } else {
      this.FuncBuild(itemdata);
    }
  }
  FuncUpdate(itemdata) {
    // console.log(itemdata.data.base.status, itemdata.data.base.laststatus);
    if (itemdata.data.base.status == 'working') {
      this.ReBuild(itemdata);
    } else if (itemdata.data.base.laststatus != itemdata.data.base.status) {
      this.ReBuild(itemdata);
    } else {
    }
  }
  // 显示 隐藏 删除 加载
  FuncActNext(act, timing, payload) {
    if (act == 'init') {
      // 
    } else if (act == 'hide') {
      if (timing == 'before') {
        
      }
    } else if (act == 'show') {
      if (timing == 'after') {
        
      }
    } else if (act == 'destroy') {
      if (timing == 'before') {
        
      } else if (timing == 'after') {
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].program.main) {
            this.list[i].program.main = null;
          }
        }
      }
    }
  }
}

export default lineitem;