/* 地图插件函数 功能类因此无需设置class */
let plugin = {
  data: {
    toolbar: {
      type: 'base',
      name: 'ToolBar',
      func: false
    },
    scalebar: {
      type: 'base',
      name: 'Scale',
      func: false
    },
    pixel: {
      type: 'base',
      name: 'Pixel',
      func: 'BaseModFunc'
    },
    lnglat: {
      type: 'base',
      name: 'LngLat',
      func: 'BaseModFunc'
    },
    marker: {
      type: 'base',
      name: 'Marker',
      func: false
    },
    line: {
      type: 'base',
      name: 'Polyline',
      func: false
    },
    popup: {
      type: 'base',
      name: 'InfoWindow',
      func: false
    },
    circle: {
      type: 'base',
      name: 'Circle',
      func: false
    },
    circlemarker: {
      type: 'base',
      name: 'CircleMarker',
      func: false

    },
    overlaygroup: {
      type: 'base',
      name: 'OverlayGroup',
      func: false

    },
    markerclusterer: {
      type: 'base',
      name: 'MarkerClusterer',
      func: 'MarkerclustererModFunc'
    },
    path: {
      load: false,
      type: 'ui',
      name: 'ui/misc/PathSimplifier',
      func: 'FuncPath',
      program: false
    }
  },
  group: {
    overlay: {

    }
  }
};
/**
 * @description 根据type加载对应的插件模块-需要异步加载的插件
 * @param {String} mod 需要加载的插件名称
 */
plugin.LoadPlugin = function (mod) {
  let self = this;
  return new Promise(function (resolve) {
    let moddata = self.data[mod];
    if (!moddata.load) {
      if (moddata.type == 'ui') {
        AMapUI.load([moddata.name], function (modfunc) {
          moddata.program = modfunc;
          moddata.load = 'loaded';
          resolve({
            status: 'success'
          });
        });
      }
    } else {
      resolve({
        status: moddata.load
      });
    }
  });
};
/**
 * @description 创建插件实例-异步加载插件
 * @param {String} mod 需要加载的插件名称
 * @param {Object} payload options {Object} 插件选项opt数据
 * @returns {Object} resolve中func传递创建的实例
 */
plugin.FuncPlugin = function (mod, payload) {
  let self = this;
  return new Promise(function (resolve) {
    self.LoadPlugin(mod).then(function (Res) {
      if (Res.status == 'success' || Res.status == 'loaded') {
        // 异步加载函数加载完成或者加载成功后调用定义好的构建函数
        self[self.data[mod].func](payload).then(function (FuncRes) {
          resolve(FuncRes);
        });
      } else {
        console.log('plugin status is error');
        resolve({
          status: 'error'
        });
      }
    });
  });
};
/**
 * @description 创建插件实例-无需加载的插件
 * @param {String} mod 需要加载的插件名称
 * @param {Object} payload map {Object} 地图实例
 * @param {Object} payload options {Object} 插件选项opt数据
 * @param {Object} payload events {Object} 绑定事件
 * @returns {Object} 插件实例
 */
plugin.FuncMod = function (mod, payload) {
  let moddata = this.data[mod];
  if (moddata.func) {
    return this[moddata.func](moddata, payload);
  } else {
    return this.DeafultModFunc(moddata, payload);
  }
};
/**
 * @description 创建插件实例-无需加载的插件
 * @param {Object} moddata name {String} 插件名称
 * @param {Object} payload map {Object} 地图实例
 * @param {Object} payload options {Object} 插件选项opt数据
 * @param {Object} payload events {Object} 绑定事件
 * @returns {Object} 插件实例
 */
plugin.DeafultModFunc = function (moddata, initdata) {
  if (initdata.map) {
    initdata.options.map = initdata.map;
  }
  let marker = new AMap[moddata.name](initdata.options);
  if (initdata.events) {
    for (let eventname in initdata.events) {
      marker.on(eventname, initdata.events[eventname]);
    }
  }
  return marker;
};
plugin.BaseModFunc = function (moddata, initdata) {
  let basefunc = new AMap[moddata.name](initdata.options[0], initdata.options[1]);
  return basefunc;
};
plugin.MarkerclustererModFunc = function (moddata, initdata) {
  let marker = new AMap.MarkerClusterer(initdata.map, initdata.list, initdata.options);
  return marker;
};
/**
 * @description 创建轨迹展示实例
 * @param {Object} payload map {Object} 地图实例
 * @param {Object} payload options {Object} 轨迹展示选项opt数据
 * @param {Object} payload data {Object} 轨迹展示路线数据
 * @returns {Object} resolve-func 轨迹展示实例
 */
plugin.FuncPath = function (payload) {
  let self = this;
  return new Promise(function (resolve) {
    let pathfunc = new self.data.path.program(payload.options);
    pathfunc.setData(payload.data);
    resolve({
      status: 'success',
      func: pathfunc
    });
  });
};
/**
 * @description 创建轨迹展示巡航器实例
 * @param {Object} pathfunc 轨迹展示实例
 * @param {Object} initdata pathoption {Object} 巡航器样式数据-width height content
 * @param {Object} initdata speed {Number} 巡航器初始速度
 * @param {Object} events 巡航器绑定事件
 * @returns {Object} 巡航器实例
 */
plugin.BuildPathNav = function (pathfunc, initdata, events) {
  let navg = pathfunc.createPathNavigator(0, {
    loop: false,
    speed: initdata.speed,
    pathNavigatorStyle: extend({}, initdata.pathoption)
  });
  function extend(dst) {
    if (!dst) {
      dst = {};
    }
    let slist = Array.prototype.slice.call(arguments, 1);
    for (let i = 0, len = slist.length; i < len; i++) {
      let source = slist[i];
      if (!source) {
        continue;
      }
      for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
          dst[prop] = source[prop];
        }
      }
    }
    return dst;
  }
  if (events) {
    for (let eventname in events) {
      navg.on(eventname, events[eventname]);
    }
  }
  return navg;
};

plugin.GetMapSearch = function(city = '全国', extensions = 'base') {
  let geocoder = new AMap.Geocoder({
    city: city, // 城市设为北京，默认："全国"
    extensions: extensions
  });
  return geocoder;
};

plugin.GetAutoInput = function({ input, output = false, datatype = 'poi', city = '全国', citylimit = false }) {
  let auto = new AMap.Autocomplete({
    input: input,
    output: output,
    datatype: datatype,
    city: city,
    citylimit: citylimit
  });
  return auto;
};

plugin.GetWalking = function({ map, outline = false, outlinecolor = 'white', autoview = false, markhide = true, panel = false }) {
  let walking = new AMap.Walking({
    map: map,
    panel: panel,
    hideMarkers: markhide,
    isOutline: outline,
    outlineColor: outlinecolor,
    autoFitVie: autoview
  });
  return walking;
};
plugin.GetRiding = function({ map, outline = false, outlinecolor = 'white', autoview = false, markhide = true, panel = false }) {
  let riding = new AMap.Riding({
    map: map,
    panel: panel,
    hideMarkers: markhide,
    isOutline: outline,
    outlineColor: outlinecolor,
    autoFitVie: autoview
  });
  return riding;
};
plugin.GetDriving = function({ map, policy = AMap.DrivingPolicy.LEAST_DISTANCE, extensions = 'all', markhide = true, ferry = 1, autoview = false, panel = false }) {
  let driving = new AMap.Driving({
    map: map,
    policy: policy,
    extensions: extensions, // 信息获取base all
    ferry: ferry, // 轮渡 0可用1不可用
    panel: panel,
    hideMarkers: markhide,
    autoFitVie: autoview

  });
  return driving;
};

export default plugin;
