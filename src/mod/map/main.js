
import _plugin from './plugin';

/**
 * @description 高德地图函数实例
 */
class map {
  load = '';// 加载判断值
  program = null;// 地图实例
  plugin = _plugin;// 地图插件函数
  zoom = {
    load: '',
    data: {
      current: '',
      last: ''
    }
  };
  offset = 0.000001;
  /**
   * @param {Object} initdata dom {Element} 地图挂载的dom
   * @param {Object} initdata options {Object} 地图选项opt数据
   */
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata);
    }
  }
  /**
   * @description 检查路径是否存在 不存在的话初始化
   * @param {Object} initdata dom {Element} 地图挂载的dom
   * @param {Object} initdata options {Object} 地图选项opt数据
   */
  FuncInit(initdata) {
    return new Promise( (resolve, reject) => {
      if (!this.load) {
        this.load = 'loading';
        this.program = new AMap.Map(initdata.dom, initdata.options);
        if (initdata.plugin) {
          AMap.plugin([
            'AMap.ToolBar',
            'AMap.Scale',
            'AMap.OverView',
            'AMap.MapType',
            'AMap.Geolocation'
          ], () => {
            if (initdata.plugin.toolbar) {
              this.program.addControl(this.plugin.FuncMod('toolbar', { options: initdata.plugin.toolbar.options }));
            }
            if (initdata.plugin.scalebar) {
              this.program.addControl(this.plugin.FuncMod('scalebar', { options: initdata.plugin.scalebar.options }));
            }
            // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件\
            // let toolopt = { offset: new AMap.Pixel(30, 60), position: 'RT' }
            // this.program.addControl(new AMap.ToolBar(toolopt));

            // // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
            // let toolScale = { offset: new AMap.Pixel(10, 10), position: 'RB' }
            // this.program.addControl(new AMap.Scale(toolScale));

            // // 在图面添加鹰眼控件，在地图右下角显示地图的缩略图
            // this.program.addControl(new AMap.OverView({isOpen:true}));

            // // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
            // this.program.addControl(new AMap.MapType());

            // // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
            // map.addControl(new AMap.Geolocation());
          });
        }
        if (initdata.event) {
          for (let v in initdata.event) {
            this.SetEvent(v, initdata.event[v]);
          }
        }
        this.SetEvent('complete', () => {
          this.load = 'success';
          resolve({
            status: 'success'
          });
        });
      } else {
        resolve({
          status: this.load
        });
      }
    });
  }
  GetContent() {
    return this.program ? this.program.getContainer() : false;
  }
  // 显示 隐藏 删除 加载
  FuncAct(act, payload) {
    if (act == 'init') {
      // a
    } else if (act == 'destroy') {
      this.program = null;
      this.load = '';
    }
  }
  InitZoom(cb) {
    this.SetEvent('zoomend', () => {
      this.SetZoomData();
      if (cb) {
        cb();
      }
    });
    this.SetZoomData();
  }
  SetZoomData() {
    this.zoom.last = this.zoom.current;
    this.zoom.current = this.GetZoom();
  }
  Checklnglat(lnglat, target) {
    if (Math.abs(lnglat - target) <= this.offset) {
      return true;
    } else {
      return false;
    }
  }
  GetSize() {
    return this.program ? this.program.getSize() : false;
  }
  SetDo({ offset, target }) {
    let mapsize = this.program.getSize();
    let targetcurrent = this.program.lngLatToContainer(this.plugin.FuncMod('lnglat', {
      options: target.position
    }));
    let targetoffset = {
      x: mapsize.width * offset.x - targetcurrent.x,
      y: mapsize.height * offset.y - targetcurrent.y
    };
    this.MoveToByNum(targetoffset);
  }
  MoveToByNum({ x, y }) {
    if (Math.abs(x) <= this.offset || Math.abs(y) <= this.offset) {

    } else {
      this.program.panBy(x, y);
    }
  }
  GetEventDo(event, data, rule) {
    if (event == 'zoomend') {
      if (rule == '!') {
        return data == this.zoom.current;
      } else if (rule == '>') {
        return !(data > this.zoom.current);
      }
    } else if (event == 'moveend') {
      let current = this.GetCenter();
      return this.Checklnglat(current.lng, data[0]) && this.Checklnglat(current.lat, data[1]);
    }
  }
  SetEventDo(event, data) {
    if (event == 'zoomend') {
      this.SetZoom(data);
    } else if (event == 'moveend') {
      this.SetCenter(data);
    }
  }
  SetEventAndCallBack(event, data, rule = '!') {
    let self = this;
    return new Promise( (resolve, reject) => {
      function EventDo() {
        resolve({
          status: 'success'
        });
        self.SetEvent(event, EventDo, 'off');
      }
      if (this.GetEventDo(event, data, rule)) {
        resolve({
          status: 'success'
        });
      } else {
        this.SetEvent(event, EventDo);
        this.SetEventDo(event, data);
      }
    });
  }
  GetZoomData() {
    return this.zoom;
  }
  GetProgram() {
    return this.program;
  }
  GetZoom() {
    return this.program.getZoom();
  }
  SetZoom(zoomdata) {
    return this.program.setZoom(zoomdata);
  }
  GetCenter() {
    return this.program.getCenter();
  }
  SetCenter(centerdata) {
    this.program.setCenter(centerdata);
  }
  AutoView() {
    this.program.setFitView();
  }
  SetEvent(eventname, func, act = 'on') {
    this.program[act](eventname, func);
  }
  FuncDestroy() {
    this.program.clearMap();
    this.program.destroy();
    this.load = false;
  }
}

export default map;
