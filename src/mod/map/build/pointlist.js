class pointlist {
  type = '';
  list = [];
  constructor(type = 'auto') {
    this.type = type;
  }
  GetList() {
    return this.list;
  }
  GetBuildData() {
    return {
      start: this.list[this.list.length - 2],
      end: this.list[this.list.length - 1]
    }
  }
  PushData(item) {
    this.list.push(item);
    let size = this.list.length;
    if (this.type == 'auto') {
      if (size == 1) {
        item.SetType('start');
      } else {
        if (size != 2) {
          let last = this.GetSibling('last', item);
          last.SetType('base');
        }
        item.SetType('end');
      }
    }
  }
  GetSibling(act, item) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i] == item) {
        if (act == 'next') {
          return this.list[i + 1];
        } else if (act == 'last') {
          return this.list[i - 1];
        }
      }
    }
    return false;
  }

}

export default pointlist;