
import BuildPath from './BuildPath';
import _formatType from './../formatType';
import _plugin from './../map/plugin';
import _func from '@/func/main';

class BuildRoad {
  load = false;
  list = [];
  constructor(contrast, contrastarray, targetprop) {
    this.data = {
      current: '',
      contrast: contrast, // 对比值
      contrastarray: contrastarray,
      targetprop: targetprop
    };
  }
  GetContrast(item) {
    let res = item;
    for (let i = 0; i < this.data.contrast.length; i++) {
      res = res[this.data.contrast[i]];
    }
    return res;
  }
  PushData(item) {
    if (this.data.current == this.GetContrast(item)) {
      this.list[this.list.length - 1].list.push(item[this.data.targetprop]);
    } else {
      this.data.current = this.GetContrast(item);
      let indata = {
        type: this.data.current,
        list: []
      };
      indata.list.push(item[this.data.targetprop]);
      if (this.list.length > 0) {
        this.list[this.list.length - 1].list.push(item[this.data.targetprop]);
      }
      this.list.push(indata);
    }
  }
  GetList() {
    return this.list;
  }
}

let TravelPath = {
  load: false,
  program: new BuildPath(),
  data: {
    // 基本数据存储
    load: false, // 数据加载状态判断值
    path: {
      // 轨迹展示数据保存位置
      listlength: 0,
      origindata: [], // 轨迹展示原始数据保存位置
      listdata: {}, // 轨迹展示路线数据
      list: [], // 轨迹展示路线点数组
      road: {
        start: {
          data: {
            position: false
          },
          program: null
        },
        end: {
          data: {
            position: false
          },
          program: null
        },
        list: []
      },
      point: {
        // 轨迹展示中停留点数据
        load: false, // 停留点加载判断值
        list: [] // 停留点数组
      }
    }
  },
  current: {
    base: {}
  },
  navg: {
    options: {
      width: 0,
      height: 0,
      icon: ''
    }
  },
  navgmod: {
    program: false
  },
  popup: {
    // 信息弹窗函数
    status: false,
    program: false
  },
  pic: {
    point: {
      start: require('./../../../public/images/point/start.svg'),
      stop: require('./../../../public/images/point/stop.svg'),
      end: require('./../../../public/images/point/end.svg')
    }
  }
};

// 获取轨迹数据
TravelPath.InitData = function (param, itembasedata) {
  return new Promise((resolve, reject) => {
    this.data.load = 'loading';
    this.current.base = _func.copyjson(itembasedata);
    let url = '/receiveInfo/selectLongLatInfo';
    _func.post(url, param, 'token').then(res => {
      this.FormatResdata(res.data.receiveInfoList, res.data.stopTimeLists);
      this.SetNavgOpations({
        width: 36,
        height: 36,
        icon: _formatType.GetMainIcon(itembasedata.maintype.prop)
      });
      this.data.load = 'loaded';
      resolve(res);
    }, res => {
      reject(res);
    });
  });
};

TravelPath.ResetItemFunc = function (act, itemdata) {
  if (act == 'point') {
    if (itemdata.program.detail) {
      itemdata.program.detail.close();
    }
    if (itemdata.program.base) {
      itemdata.program.base.setMap(null);
    }
  } else if (act == 'road') {
    if (itemdata.program) {
      itemdata.program.setMap(null);
    }
  } else if (act == 'startend') {
    if (itemdata.program) {
      itemdata.program.setMap(null);
    }
  }
};
TravelPath.ReDo = function () {
  // 轨迹数据格式化
  this.data.path.origindata = [];
  this.data.path.list = [];
  this.data.path.listdata = {
    name: '轨迹路线',
    path: []
  };
  // 道路数据起始点格式化
  for (let i = 0; i < this.data.path.road.list.length; i++) {
    this.ResetItemFunc('road', this.data.path.road.list[i]);
  }
  this.data.path.road.list = [];
  this.ResetItemFunc('startend', this.data.path.road.start);
  this.ResetItemFunc('startend', this.data.path.road.end);
  // 停留点格式化
  for (let i = 0; i < this.data.path.point.list.length; i++) {
    this.ResetItemFunc('point', this.data.path.point.list[i]);
  }
  this.data.path.point.list = [];
};
TravelPath.FormatResdata = function (pathlist, stoppointlist) { // 描绘一条路线
  if (pathlist && pathlist.length > 1) {
    this.ReDo();
    let roaddata = new BuildRoad(['workstatus', 'prop'], ['atwork', 'notwork'], 'position');
    for (let i = 0; i < pathlist.length; i++) {
      let pathitem = {
        id: pathlist[i].id,
        carnum: pathlist[i].vehCode,
        position: [pathlist[i].tTranLongitude, pathlist[i].tTranLatitude],
        speed: pathlist[i].recVehSpeed,
        direction: pathlist[i].recVchDirection,
        workstatus: _formatType.GetType('car', { target: 'workstatus', data: pathlist[i].recJobStatus }),
        carsttaus: _formatType.GetType('car', { target: 'carstatus', data: pathlist[i].recVehStatus }),
        collectiontime: _func.TimestampToStr(pathlist[i].recCollectionTime)
      };
      this.data.path.origindata.push(pathitem);
      this.data.path.listdata.path.push(pathitem.position);
      roaddata.PushData(pathitem);
      // 起始点数据保存
      if (i == 0) {
        this.data.path.road.start.data.position = pathitem.position;
      } else if (i == pathlist.length - 1 && i > 0) {
        this.data.path.road.end.data.position = pathitem.position;
      }
    }
    this.data.path.listlength = this.data.path.listdata.path.length;
    this.data.path.list.push(this.data.path.listdata);
    // 路线格式化
    let roadlist = roaddata.GetList();
    for (let i = 0; i < roadlist.length; i++) {
      let options = {
        color: roadlist[i].type == 'atwork' ? '#00ff00' : '#ff6600'
      };
      this.PushRoadData(roadlist[i].list, options);
    }
    // 停留点格式化
    for (let i = 0; i < stoppointlist.length; i++) {
      this.data.path.point.list.push({
        id: stoppointlist[i].id,
        address: stoppointlist[i].tAddress,
        vincode: stoppointlist[i].vehVinCode,
        time: stoppointlist[i].tStopData,
        starttime: _func.TimestampToStr(stoppointlist[i].tStopTime),
        endtime: _func.TimestampToStr(stoppointlist[i].tEndStopTime),
        carnum: stoppointlist[i].vehCode,
        position: [stoppointlist[i].tLongitude, stoppointlist[i].tLatitude],
        program: {
          base: null,
          detail: null
        },
        init: {
          base: false,
          detail: false
        },
        show: {
          detail: false
        }
      });
    }
  } else {
    _func.showmsg('对应车辆在时间范围内的数据为空，请更改检索条件后重试');
  }
};

TravelPath.SetNavgOpations = function (navgoptions) {
  this.navg.options = navgoptions;
};
// 设置路线函数
TravelPath.PushRoadData = function (path, style) {
  this.data.path.road.list.push({
    program: false,
    options: {
      path: path,
      strokeWeight: 6,
      borderWeight: 0,
      zIndex: 110,
      strokeColor: style.color, // 线条颜色
      lineJoin: 'round' // 折线拐点连接处样式
    }
  });
};
// 设置停留点
TravelPath.SetPathPoint = function (act, maxtime, mapfunc) {
  if (act) {
    if (this.data.path.point.list.length > 0 && this.data.load == 'loaded') {
      for (let i = 0; i < this.data.path.point.list.length; i++) {
        let pointitem = this.data.path.point.list[i];
        if (pointitem.position[0] && pointitem.position[1] && parseInt(pointitem.time) >= maxtime) {
          if (!pointitem.init.base) {
            pointitem.program.base = _plugin.FuncMod('marker', {
              options: {
                position: pointitem.position,
                content: this.FuncGetPointHtml('stop'),
                offset: _plugin.FuncMod('pixel', {
                  options: [0, 0]
                }),
                anchor: 'bottom-center',
                zIndex: 109
              },
              map: mapfunc
            });
            pointitem.init.base = true;
          } else {
            pointitem.program.base.show();
          }
          if (!pointitem.init.detail) {
            pointitem.program.detail = _plugin.FuncMod('popup', {
              options: {
                isCustom: true, // 使用自定义窗体
                autoMove: false, // 是否自动调整窗体到视野内
                // position: pointitem.position,
                content: this.GetPointHtml(pointitem),
                offset: _plugin.FuncMod('pixel', {
                  options: [0, -30]
                })
              }
            });
            pointitem.program.detail.on('open', function () {
              pointitem.show.detail = true;
            });
            pointitem.program.detail.on('close', function () {
              pointitem.show.detail = false;
            });
            pointitem.program.base.on('click', function () {
              if (pointitem.show.detail) {
                pointitem.program.detail.close();
              } else {
                pointitem.program.detail.open(
                  mapfunc,
                  pointitem.position
                );
              }
            });
            pointitem.init.detail = true;
          }
        } else {
          if (pointitem.init.base) {
            pointitem.program.base.hide();
          }
        }
      }
    } else if (this.data.path.point.list.length == 0 && this.data.load == 'loaded') {
      _func.showmsg('停留点为空');
    }
  } else {
    this.FuncPoint('hide');
  }
};
TravelPath.FuncPoint = function (act) {
  if (act == 'hide') {
    for (let i = 0; i < this.data.path.point.list.length; i++) {
      let pointitem = this.data.path.point.list[i];
      if (pointitem.program.base) {
        pointitem.program.base.hide();
      }
      if (pointitem.program.detail) {
        pointitem.program.detail.close();
      }
    }
  } else if (act == 'destroy') {
    this.data.path.point.list = [];
  }
};
TravelPath.GetPointHtml = function (pointdata) {

  let detaildom = document.createElement('div');
  detaildom.innerHTML = `
    <div class='mappop_div'>
      <div class="mappop_fixmenu mappop_link js_close " >
        <p class="mappop_fixmenuicon"><i class="el-icon-close"></i></p>
      </div>
      <div class='mappop_area'>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>停车时长 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_speed'>${pointdata.time}</p>
            </div>
          </div>
        </div>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>停车开始 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_direction'>${pointdata.starttime}</p>
            </div>
          </div>
        </div>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>停车结束 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_powernum'>${pointdata.endtime}</p>
            </div>
          </div>
        </div>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>停车位置 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_status'>${pointdata.address}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mappop_angeldiv">
        <div class="mappop_angel"></div>
      </div>
    </div>
  `.trim();
  detaildom.getElementsByClassName('js_close')[0].onclick = () => {
    pointdata.program.detail.close();
  }
  return detaildom;
};
TravelPath.FuncGetPointHtml = function (type) {
  let src = this.pic.point[type];
  let html = `
        <div>
            <img style="width: 30px;"  src="${src}" />
        </div>
    `.trim();
  return html;
};
// 设置道路
TravelPath.SetRoad = function (mapfunc) {
  for (let i = 0; i < this.data.path.road.list.length; i++) {
    this.data.path.road.list[i].program = _plugin.FuncMod('line', {
      options: this.data.path.road.list[i].options,
      map: mapfunc
    });
  }
  if (this.data.path.road.start.data.position) {
    this.data.path.road.start.program = _plugin.FuncMod('marker', {
      options: {
        position: this.data.path.road.start.data.position,
        content: this.FuncGetPointHtml('start'),
        offset: _plugin.FuncMod('pixel', {
          options: [0, 0]
        }),
        anchor: 'bottom-center',
        zIndex: 109
      },
      map: mapfunc
    });
  }
  if (this.data.path.road.end.data.position) {
    this.data.path.road.end.program = _plugin.FuncMod('marker', {
      options: {
        position: this.data.path.road.end.data.position,
        content: this.FuncGetPointHtml('end'),
        offset: _plugin.FuncMod('pixel', {
          options: [0, 0]
        }),
        anchor: 'bottom-center',
        zIndex: 109
      },
      map: mapfunc
    });
  }
};
TravelPath.ResetFunc = function () {
  if (this.program.program) {
    this.FuncNavgModByAct('destroy');
    this.FuncPopup('destroy');
    this.load = false;
  }
};
TravelPath.BuildProgram = function (mapfunc) {
  let self = this;
  return new Promise(function (resolve, reject) {
    // 重复加载的时候重置当前的状态
    self.ResetFunc();
    if (self.data.path.listlength < 2) {
      self.load = false;
      resolve({ status: 'nodata' });
    } else {
      self.load = 'loading';
      self.SetRoad(mapfunc);
      self.program.FuncInit({
        mapprogram: mapfunc,
        list: self.data.path.list,
        // option实例信息的参数
        options: {
          zIndex: 111,
          map: mapfunc, // 所属的地图实例
          getPath: function (pathData, pathIndex) {
            // 返回轨迹数据中的节点坐标信息，[AMap.LngLat, AMap.LngLat...] 或者 [[lng|number,lat|number],...]
            return pathData.path;
          },
          getHoverTitle: function (pathData, pathIndex, pointIndex) {
            return null;
          },
          renderOptions: {// 轨迹线的样式
            pathLineStyle: {
              strokeStyle: 'rgba(255,255,255,0)',
              lineWidth: 0,
              borderStyle: 'rgba(255,255,255,0)',
              borderWidth: 0,
              dirArrowStyle: false
            }
          }
        },
        data: {
          listlength: self.data.path.listlength
        },
        navg: {
          options: self.navg.options,
          speed: {
            base: 500,
            num: 2
          },
          events: {
            move: function (movedata, pathdata) {
              self.FuncNavgModByAct('move', false, pathdata);
            }
          }
        }
      }).then(function (Res) {
        self.FuncNavgModByAct('init', mapfunc);
        self.load = 'loaded';
        resolve({ status: 'success' });
      }, function (Res) {
        reject(Res);
      });
    }
  });
};

// 创建信息窗实例
TravelPath.FuncNavgModByAct = function (act, mapfunc, pathdata) {
  let self = this;
  if (act == 'init') {
    let position = this.program.navg.GetPosition();
    this.navgmod.program = _plugin.FuncMod('marker', {
      options: {
        position: [position.lng, position.lat],
        content: `<div style='width: 50px; height: 50px; background-color: rgba(0,0,0,0); ' ></div>`,
        offset: _plugin.FuncMod('pixel', {
          options: [-25, -25]
        }),
        zIndex: 120
      },
      map: mapfunc
    });
    this.navgmod.program.on('click', function () {
      if (self.popup.program) {
        if (self.popup.status == 'open') {
          self.FuncPopup('close');
        } else {
          self.FuncPopup('open', mapfunc);
        }
      }
    });
    this.SetPopup(mapfunc);
  } else if (act == 'move') {
    this.navgmod.program.setPosition(this.program.navg.GetPosition());
    this.FuncPopup('move', false, pathdata);
  } else if (act == 'destroy') {
    if (this.navgmod.program) {
      this.navgmod.program.hide();
      // this.navgmod.program = null;
    }
  }
};
// 创建信息窗实例
TravelPath.SetPopup = function (mapfunc) {
  let self = this;
  let index = this.program.navg.GetIndex().idx;
  let html = this.GetPopupHtml('init', index);
  this.popup.program = _plugin.FuncMod('popup', {
    options: {
      isCustom: true, // 使用自定义窗体
      autoMove: false, // 是否自动调整窗体到视野内
      content: html,
      offset: _plugin.FuncMod('pixel', {
        options: [0, -25]
      })
    }
  });
  this.popup.program.on('open', function () {
    self.popup.status = 'open';
  });
  this.popup.program.on('close', function () {
    self.popup.status = false;
  });
  this.FuncPopup('open', mapfunc);
};
// 信息框操作
TravelPath.FuncPopup = function (act, mapfunc, pathdata) {
  if (this.popup.program) {
    if (act == 'move') {
      this.popup.program.setPosition(this.program.navg.GetPosition());
      this.GetPopupHtml('update', pathdata.dataItem.pointIndex);
    } else if (act == 'open') {
      this.popup.program.open(
        mapfunc,
        this.program.navg.GetPosition()
      );
    } else if (act == 'close') {
      this.popup.program.close();
    } else if (act == 'destroy') {
      if (this.popup.status == 'open') {
        this.FuncPopup('close');
      }
      this.popup.program = null;
    }
  }
};
// 获取信息框HTML
TravelPath.GetPopupHtml = function (act, index) {
  let pathlist = this.FuncPathList('get', 'in', 'origin');
  let itemdata = pathlist[index];
  let popupdom;
  if (act == 'init') {
    popupdom = document.createElement('div');
    popupdom.innerHTML = `
    <div class='mappop_div'>
      <div class="mappop_fixmenu mappop_link js_close " >
        <p class="mappop_fixmenuicon"><i class="el-icon-close"></i></p>
      </div>
      <div class='mappop_title'>
        <p>${itemdata.carnum} ( ${this.current.base.detailname} )</p>
      </div>
      <div class='mappop_area'>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>速度 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_speed'>${itemdata.speed} km/h</p>
            </div>
          </div>
        </div>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>方向 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_direction'>${itemdata.direction} 度</p>
            </div>
          </div>
        </div>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>状态 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_status'>${itemdata.workstatus.name}</p>
            </div>
          </div>
        </div>
        <div class='mappop_list'>
          <div class='mappop_item'>
            <div class='mappop_itemtitle'>
              <p class='mappop_itemname'>定位时间 :</p>
            </div>
            <div class='mappop_itemcontent'>
              <p class='js_time'>${itemdata.collectiontime}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mappop_angeldiv">
        <div class="mappop_angel"></div>
      </div>
    </div>
    `.trim();
    popupdom.getElementsByClassName('js_close')[0].onclick = () => {
      this.FuncPopup('close');
    }
  } else if (act == 'update') {
    popupdom = this.popup.program.getContent();
    popupdom.getElementsByClassName('js_speed')[0].innerHTML = itemdata.speed + ' km/h';
    popupdom.getElementsByClassName('js_direction')[0].innerHTML = itemdata.direction + '度';
    popupdom.getElementsByClassName('js_status')[0].innerHTML = itemdata.workstatus.name;
    popupdom.getElementsByClassName('js_time')[0].innerHTML = itemdata.collectiontime;
  }
  return popupdom;
};
// 获取轨迹数据函数
TravelPath.FuncPathList = function (act, type, datatype) {
  if (act == 'get') {
    if (type == 'in') {
      if (datatype == 'origin') {
        return this.data.path.origindata;
      }
    }
  }
};
TravelPath.FuncDestroy = function () {
  this.program.FuncDestroy(true);
  this.ReDo();
  this.load = false;
};

export default TravelPath;