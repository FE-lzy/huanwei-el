import _func from '@/func/main';

class linedata {
  current = '';
  options = {};
  data = {};
  constructor({ options, res }) {
    this.options = options;
    for (let v in res) {
      this.data[v] = res[v];
      this.data[v].list = [];
    }
  }

  PushData(item) {
    // console.log(item.status);
    let current = this.FuncProp(item);
    if (this.current === current) {
      this.FuncPush('add', item);
    } else {
      this.current = current;
      this.FuncPush('build', item);
    }
  }
  FuncProp(item) {
    let temp = item;
    for (let i = 0; i < this.options.prop.length; i++) {
      if (i == this.options.prop.length - 1 && this.options.type == 'set') {
        temp[this.options.prop[i]] = this.options.target;
      }
      temp = temp[this.options.prop[i]];
    }
    return temp;
  }
  FuncPush(act, item) {
    if (act == 'add') {
      for (let v in this.data) {
        let resitem = this.FuncPushNext(this.data[v], item);
        this.data[v].list[this.data[v].list.length - 1].list.push(resitem);
      }
    } else if (act == 'build') {
      // console.log(this.current)
      for (let v in this.data) {
        let resdata = {
          type: this.current,
          list: []
        };
        let resitem = this.FuncPushNext(this.data[v], item);
        if (this.data[v].list.length > 0) {
          this.data[v].list[this.data[v].list.length - 1].list.push(resitem);
        }
        resdata.list.push(resitem);
        this.data[v].list.push(resdata);
      }
    }
  }
  FuncPushNext(options, item) {
    let resitem;
    if (options.type == 'string') {
      resitem = item[options.prop];
    } else if (options.type == 'object') {
      resitem = {};
      for (let i = 0; i < options.prop.length; i++) {
        let target = options.prop[i];
        resitem[target] = item[target]
      }
    }
    return resitem;
  }

  GetData() {
    let res = {};
    for (let v in this.data) {
      res[v] = this.data[v].list;
    }
    return res;
  }
}

export default linedata;