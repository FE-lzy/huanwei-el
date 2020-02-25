import _func from '@/func/main';

/**
 * @description 覆盖物数组
 */
class events {
  mod = {};
  data = {};
  temp = {};
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata);
    }
  }
  FuncInit({ mod = {}, list = [] }) {
    this.FuncMod('init', mod);
    this.FuncData('init', list);
  }
  FuncLoad({ mod, list }) {
    if (mod) {
      this.FuncMod('set', mod);
    }
    if (list) {
      this.FuncData('set', list);
    }
  }
  FuncMod(act, data) {
    if (act == 'init') {
      this.mod = data;
    } else if (act == 'set') {
      this.mod = data.data;
    } else if (act == 'reset') {
      if (data.act == 'base') {
        for (let i = 0; i < data.list.length; i++) {
          if (this.mod[data.list[i]]) {
            this.temp[data.list[i]] = this.mod[data.list[i]];
            delete this.mod[data.list[i]];
          }
        }
      } else if (data.act == 'total') {
        for (let v in this.temp) {
          this.mod[v] = this.temp[v];
          delete this.temp[v];
        }
      }
    }
  }
  FuncData(act, data) {
    if (act == 'init') {
      for (let i = 0; i < data.length; i++) {
        this.data[data[i]] = {
          list: []
        }
      }
    } else if (act == 'set') {
      if (data) {
        for (let v in data) {
          this.FuncItem('set', {
            name: v,
            type: data[v].type,
            list: data[v].list
          });
        }
      }
    }
  }

  FuncModAct(act, data) {
    if (act == 'get') {
      return this.mod[data.name];
    }
  }

  FuncItem(act, data) {
    let target = this.data[data.name];
    if (act == 'set') {
      if (!target) {
        console.error(`${data.name} 事件未找到`)
      } else {
        if (data.type == 'cover') {
          target.list = data.list;
        } else if (data.type == 'add') {
          target.list = target.list.concat(data.list);
        }
      }
    } else if (act == 'get') {
      if (target) {
        return target.list;
      } else {
        return [];
      }
    }
  }
}

export default events;
