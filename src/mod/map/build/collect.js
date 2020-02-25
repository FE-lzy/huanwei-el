import _plugin from './../plugin';

/**
 * @description 覆盖物数组
 */
class collect {
  load = '';
  program = null;
  status = '';
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata);
    }
  }
  FuncInit({ list = [], options, map }) {
    if (!this.load) {
      this.program = _plugin.FuncMod('markerclusterer', {
        options: options,
        list: list,
        map: map
      });
    } else {
      this.PushData('list', list);
      this.SetMap(map);
    }
    this.load = 'success';
    this.status = 'show';
  }
  FuncAct(act, payload) {
    if (this.program) {
      if (act == 'hide') {
        this.ClearData();
        this.status = 'hide';
      } else if (act == 'show') {
        this.program.addMarkers(payload);
        this.status = 'show';
      } else if (act == 'destroy') {
        this.ClearData();
        this.SetMap(null);
        this.status = '';
      }
    }
  }
  SetMap(mapfunc) {
    if (this.program) {
      this.program.setMap(mapfunc);
    }
  }
  ClearData() {
    if (this.program) {
      this.program.clearMarkers();
    }
  }
  PushData(act, indata) {
    if (this.program) {
      if (this.status == 'show') {
        if (act == 'item') {
          this.program.addMarker(indata);
        } else if (act == 'list') {
          for (let i = 0; i < indata.length; i++) {
            this.program.addMarker(indata[i]);
          }
        }
        return 'success';
      } else {
        return 'unshow';
      }
    } else {
      return 'unload';
    }
  }
  FuncData(act, data) {
    if (this.program) {
      if (act == 'del') {
        this.program.removeMarkers(data);
      }
    }
  }
  CountNum() {
    if (this.program) {
      return this.program.getClustersCount();
    } else {
      return 0;
    }
  }
}

export default collect;
