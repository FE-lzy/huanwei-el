import _plugin from './../plugin';
import map from '../main';

/**
 * @description 覆盖物数组
 */
class itemgroup {
  load = '';
  mapprogram = null; // 地图实例
  program = null; // 覆盖物实例
  status = '';
  /**
   * @param {Array} list 覆盖物实例数组
   */
  constructor(list = []) {
    if (!this.load) {
      this.program = _plugin.FuncMod('overlaygroup', {
        options: list
      });
    } else {
      this.PushData('list', list);
    }
    this.load = 'success';
  }
  /**
   * @description 添加覆盖物
   * @param {String} act 单独还是数组
   * @param {Object | Array} indata 需要添加的覆盖物实例或者实例数组
   */
  PushData(act, indata) {
    if (this.program) {
      if (act == 'item') {
        this.program.addOverlay(indata);
      } else if (act == 'list') {
        for (let i = 0; i < indata.length; i++) {
          this.program.addOverlay(indata[i]);
        }
      }
      return 'success';
    } else {
      return 'unload';
    }
  }
  /**
   * @description 添加到地图
   * @param {Object} mapprogram 地图实例
   */
  SetMap(mapprogram, hide) {
    if (mapprogram) {
      this.SetMapprogram(mapprogram);
    }
    if (this.program) {
      this.program.setMap(this.mapprogram);
      if (this.mapprogram) {
        if (hide == 'hide') {
          this.FuncAct('hide');
        } else {
          this.status = 'show';
        }
      } else {
        this.status = '';
      }
    }
    return this.status == 'show';
  }
  SetMapprogram(mapprogram) {
    this.mapprogram = mapprogram;
  }
  /**
   * @description 循环内部实例
   * @param {Function} func 循环函数
   */
  ForEachList(func) {
    this.program.eachOverlay(func);
  }
  FuncAct(act) {
    if (this.program) {
      if (act == 'hide') {
        this.program.hide();
        this.status = 'hide';
      } else if (act == 'show') {
        if (!this.status) {
          this.SetMap();
        } else {
          this.program.show();
          this.status = 'show';
        }
      } else if (act == 'destroy') {
        this.ClearData();
        this.SetMapprogram(null);
        this.SetMap();
        this.status = '';
      }
    }
  }
  GetList() {
    if (this.program) {
      return this.program.getOverlays();
    } else {
      return [];
    }
  }
  RemoveList(list) {
    this.program.removeOverlays(list);
  }
  ClearData() {
    if (this.program) {
      this.program.clearOverlays();
    }
  }
  FuncData(act, data) {
    if (this.program) {
      if (act == 'del') {
        this.program.removeOverlays(data);
      }
    }
  }
}

export default itemgroup;
