class pathitem {
  type = '';
  show = '';
  mapfunc = null;
  road = [];
  point = [];
  constructor(type = 'default', show = 'show') {
    this.type = type;
    this.show = show;
  }
  GetPathByShow() {
    let path;
    if (this.show == 'show') {
      path = [];
      if (this.type == 'default') {
        for (let i = 0; i < this.road.length; i++) {
          let itempath = this.road[i].GetPath('string');
          path = path.concat(itempath);
        }
      } else {
        for (let i = this.road.length - 1; i >= 0; i--) {
          let itempath = this.road[i].GetPath('string');
          itempath.reverse();
          path = path.concat(itempath);
        }
      }
    }
    return path;
  }
  ReGetSize() {
    let size = 0;
    for (let i = 0; i < this.road.length; i++) {
      size += this.road[i].FuncSize('get');
    }
    return size;
  }
  GetShow() {
    return this.show;
  }
  SetMapFunc(mapfunc) {
    this.mapfunc = mapfunc;
  }
  GetList(target) {
    return this[target];
  }
  GetListProp(target) {
    let list = this[target];
    let reslist = [];
    for (let i = 0; i < list.length; i++) {
      reslist.push({
        id: list[i].id,
        type: list[i].type,
        roadtype: list[i].roadtype
      })
    }
    return reslist;
  }
  PushData(target, item) {
    this[target].push(item);
    if (target == 'point') {
      let size = this.point.length;
      if (size == 1) {
        item.SetType(this.type == 'default' ? 'start' : 'end');
      } else {
        if (size != 2) {
          let last = this.GetSibling('point', 'last', item);
          last.SetType('base');
        }
        item.SetType(this.type == 'default' ? 'end' : 'start');
      }
    }
  }
  DelData(target, item) {
    let index = this.GetIndex(target, item);
    if (index !== false) {
      this[target].splice(index, 1);
      return true;
    } else {
      return false;
    }
  }
  ReplacePoint(newpoint, targetpoint) {
    let index = this.GetIndex('point', targetpoint);
    this.point.splice(index, 0, newpoint);
  }
  ReplaceRoad(roaditem, newlist) {
    let index = this.GetIndex('road', roaditem);
    if (index !== false) {
      if (newlist.length == 1) {
        this.road.splice(index, 1, newlist[0]);
      } else if (newlist.length == 2) {
        if (this.type == 'back') {
          newlist.reverse();
        }
        this.road.splice(index, 1, newlist[0], newlist[1]);
      }
      return true;
    } else {
      return false;
    }
  }
  GetIndex(target, item) {
    for (let i = 0; i < this[target].length; i++) {
      if (this[target][i] == item) {
        return i;
      }
    }
    return false;
  }
  GetSibling(target, act, item) {
    let index = this.GetIndex(target, item);
    if (index !== false) {
      if (act == 'next') {
        return this[target][index + 1];
      } else if (act == 'last') {
        return this[target][index - 1];
      }
    } else {
      return false;
    }
  }
  GetEnd(target) {
    return this[target][this[target].length - 1];
  }
  GetStart(target) {
    return this[target][0];
  }
  FuncAct(target, act) {
    if (act == 'show') {
      for (let i = 0; i < this[target].length; i++) {
        this[target][i].FuncAct('show');
      }
      this.show = 'show';
    } else if (act == 'hide') {
      for (let i = 0; i < this[target].length; i++) {
        this[target][i].FuncAct('hide');
      }
      this.show = 'hide';
    } else if (act == 'destroy') {
      if (target == 'total') {
        this.FuncAct('road', 'destroy');
        this.FuncAct('point', 'destroy');
        this.show = '';
      } else {
        for (let i = 0; i < this[target].length; i++) {
          this[target][i].FuncAct('destroy');
        }
        this[target] = [];
      }
    }
  }
  GetBuildPoint() {
    return {
      start: this.point[this.point.length - 2],
      end: this.point[this.point.length - 1]
    }
  }
  SetCurrentPoint(target) {
    for (let i = 0; i < this.point.length; i++) {
      if (this.point[i] != target) {
        this.point[i].FuncCurrentType('base');
      } else {
        this.point[i].FuncCurrentType('current');
      }
    }
  }
  GetRoadByPoint(point) {
    let res = {
      start: null,
      end: null
    };
    for (let i = 0; i < this.road.length; i++) {
      let prop = this.road[i].GetPointName(point);
      if (prop) {
        res[prop] = this.road[i];
      }
      if (res.start && res.end) {
        return res;
      }
    }
    return res;
  }

}

export default pathitem;