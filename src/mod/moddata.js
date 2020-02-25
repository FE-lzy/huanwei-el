import _func from '@/func/main';
import _formatType from './formatType';
import _plugin from './map/plugin';
import _markitem from './map/build/markitem';
import _lineitem from './map/build/lineitem';
import _linedata from './map/build/linedata';
import _monidata from './map/build/monidata';
import formatType from './formatType';
import _device from './device';
let maindatadata;
let moddata = {
  maindata: {
    organization: ''
  },
  init: {
    data: {
      list: [
        {
          name: 'car',
          act: 'total'
        },
        {
          name: 'road',
          act: 'total'
        },
        {
          name: 'trash',
          act: 'total'
        }
      ]
    },
    load: {
      car: '',
      trash: ''
    }
  },
  data: {
    car: new _markitem({
      name: 'car',
      list: [],
      data: {
        onlinelist: [],
        offlinelist: []
      },
      events: {
        mod: {
          type: 'cover',
          data: {
            zoom: {
              data: 'do'
            },
            update: {
              data: 'do'
            },
            popup: {
              data: 'do'
            },
            collect: {
              data: 'do'
            }
          }
        },
        list: {
          Inited: {
            type: 'add',
            list: ['BuildOtherList']
          },
          Updating: { // 基本数据更新中事件
            type: 'add',
            list: ['FuncTimeByUpdating']
          },
          Updated: { // 基本数据更新完成事件
            type: 'add',
            list: ['FuncTimeByUpdate']
          },
          click: { // 基本对象的点击事件
            type: 'add',
            list: ['FuncDefaultBaseEventByAct', 'FuncCurrentCallback']
          }
        }
      },
      methods: {
        FuncEventsMod(act) {
          this.data.buildtype = act;
          if (act == 'base') {
            this.events.FuncMod('reset', {
              act: act,
              list: ['zoom', 'update', 'popup', 'collect']
            });
          } else {
            this.events.FuncMod('reset', {
              act: act
            });
          }
        },
        // 加载基本数据的接口
        LoadData: function (act) {
          return new Promise((resolve, reject) => {
            let postdata = {
              'carNumber': '',
              'mapMark': '',
              'orgId': 'wz',
              'vehStatus': ''
            };
            _func.post('/locate/list', postdata, 'token').then(res => {
              moddata.maindata.organization = res.data.orgName;
              let list = this.FuncFormatList(act, res.data.points);
              resolve({
                status: 'success',
                list: list
              });
            }, res => {
              reject(res);
            });
          });
        },
        FuncCurrentCallback({ itemdata }) {
          this.FuncSetCurrent(itemdata);
        },
        // 格式化基本数据
        FuncFormatData: function (act, itemdata, resitem) {
          itemdata.data.base = {
            current: false,
            id: resitem.vehId,
            vincode: resitem.vinCode,
            carnum: resitem.vehCode,
            maintype: _formatType.GetType('car', {
              target: 'maintype',
              data: resitem.useCode
            }),
            workstatus: _formatType.GetType('car', {
              target: 'workstatus',
              data: resitem.operatingStatus
            }),
            carstatus: _formatType.GetType('car', {
              target: 'carstatus',
              data: resitem.vehicleStatus
            }),
            angle: _func.FuncDirectionToAngle(resitem.direction)
          };
          itemdata.data.base.detailname = resitem.useTypeName ? resitem.useTypeName : itemdata.data.base.maintype.name;
          itemdata.data.base.icon = _formatType.GetIcon('car', {
            maintype: itemdata.data.base.maintype.prop,
            carstatus: itemdata.data.base.carstatus.prop,
            workstatus: itemdata.data.base.workstatus.prop
          });
          if (!resitem.longitude || !resitem.latitude) {
            itemdata.data.base.position = false;
          } else {
            itemdata.data.base.position = [Number(resitem.longitude), Number(resitem.latitude)];
          }
        },
        FuncOptions(itemdata) {
          let options = {
            position: itemdata.data.base.position,
            content: document.createElement('div')
          };
          let itemscale = this.GetScale(this.mapfunc.GetZoomData().current);
          let contentdata = itemdata.data.base.icon;
          let height = 40;
          let fontsize = 53 / 3 * 0.6;
          options.content.innerHTML = `
            <img style=' height: ${height}px;transform: rotate(${itemdata.data.base.angle}deg); ' src='${contentdata.src}' />
            <p style=' margin: 0; padding: 0; position: absolute; top: 0; left: 0; right: 0; bottom: 0; text-align: center; line-height: ${height}px; font-size:${fontsize}px; color: #fff; ' >${contentdata.name}</p>
          `.trim();
          options.content.style.position = 'relative';
          options.content.style.transform = `scale(${itemscale})`;
          return options;
        },
        FuncOptionsToPopup(itemdata) {
          let options = {
            isCustom: true, // 使用自定义窗体
            autoMove: false, // 是否自动调整窗体到视野内
            content: this.FuncGetPopupDom(itemdata),
            offset: _plugin.FuncMod('pixel', {
              options: [10, -30]
            })
          };
          return options;
        },
        // 加载详情窗口
        FuncGetPopupDom(itemdata) {
          let popupdom = document.createElement('div');
          popupdom.innerHTML = `
            <div class='mappop_div'>
              <div class='mappop_fixmenu mappop_link js_close ' >
                <p class='mappop_fixmenuicon'><i class='el-icon-close'></i></p>
              </div>
              <div class='mappop_title'>
                <p>${itemdata.data.base.carnum} ( ${itemdata.data.base.detailname} )</p>
              </div>
              <div class='mappop_img'>
                <img class='js_img' src='${itemdata.data.detail.imgsrc ? itemdata.data.detail.imgsrc : '/images/carempty.png'}' />
              </div>
              <div class='mappop_area'>
                <div class='mappop_menulist mappop_border'>
                  <div class='mappop_menuitem mappop_link js_link' data-act='travel'>
                    <p>轨迹</p>
                  </div>
                  <div class='mappop_menuitem mappop_link js_link' data-act='follow'>
                    <p>跟踪</p>
                  </div>
                  <div class='mappop_menuitem mappop_link js_link' data-act='video'>
                    <p>视频</p>
                  </div>
                  <div class='mappop_menuitem mappop_link js_link' data-act='info'>
                    <p>详情</p>
                  </div>
                </div>
                <div class='mappop_list'>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemicon'><i class='el-icon-location'></i></p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_address'">${itemdata.data.detail.address}</p>
                    </div>
                  </div>
                </div>
                <div class='mappop_list'>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemname'>速度 :</p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_speed'>${itemdata.data.detail.speed} km/h</p>
                    </div>
                  </div>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemname'>方向 :</p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_direction'>${itemdata.data.detail.direction}</p>
                    </div>
                  </div>
                </div>
                <div class='mappop_list'>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemname'>${itemdata.data.detail.powertype.prop == 'oil' ? '油量' : '电量'} :</p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_powernum'>${itemdata.data.detail.powernum}</p>
                    </div>
                  </div>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemname'>状态 :</p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_status'>
                      <span style='color: ${itemdata.data.base.workstatus.color}' >${itemdata.data.base.workstatus.name}</span>
                      <span>/</span>
                      <span style='color: ${itemdata.data.base.carstatus.color}' >${itemdata.data.base.carstatus.name}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class='mappop_list'>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemname'>定位时间 :</p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_time'>${itemdata.data.detail.time}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class='mappop_angeldiv'>
                <div class='mappop_angel'></div>
              </div>
            </div>
            `.trim();
          popupdom.getElementsByClassName('js_close')[0].onclick = () => {
            this.FuncPopupAct('close', itemdata);
          }
          let linklist = popupdom.getElementsByClassName('js_link');
          for (let i = 0; i < linklist.length; i++) {
            linklist[i].onclick = (e) => {
              let act = e.currentTarget.dataset.act;
              this.PopupMenuClick(act, itemdata);
            }
          }
          return popupdom;
        },
        PopupMenuClick(menu, itemdata) {
          if (menu == 'travel') {
            _func.FuncLink('router', {
              name: '轨迹回放',
              params: {
                carnum: itemdata.data.base.carnum
              }
            });
          } else if (menu == 'info') {
            _func.FuncLink('router', {
              name: '车辆详情',
              params: {
                vin: itemdata.data.base.vincode,
                carNum: itemdata.data.base.carnum
              }
            });
          }
        },
        FuncOptionsToCollect() {
          let options = {
            maxZoom: 12,
            renderClusterMarker: ({ count, markers, marker }) => {
              let factor = Math.pow(count / this.collect.CountNum(), 1 / 18);
              let div = document.createElement('div');
              let Hue = 180 - factor * 180;
              let bgColor = 'hsla(' + Hue + ',100%,50%,0.7)';
              let fontColor = 'hsla(' + Hue + ',100%,20%,1)';
              let borderColor = 'hsla(' + Hue + ',100%,40%,1)';
              let shadowColor = 'hsla(' + Hue + ',100%,50%,1)';
              div.style.backgroundColor = bgColor;
              let size = Math.round(30 + Math.pow(count / this.collect.CountNum(), 1 / 5) * 20);
              div.style.width = div.style.height = size + 'px';
              div.style.border = 'solid 1px ' + borderColor;
              div.style.borderRadius = size / 2 + 'px';
              div.style.boxShadow = '0 0 1px ' + shadowColor;
              div.innerHTML = count;
              div.style.lineHeight = size + 'px';
              div.style.color = fontColor;
              div.style.fontSize = '14px';
              div.style.textAlign = 'center';
              marker.setOffset(_plugin.FuncMod('pixel', {
                options: [-size / 2, -size / 2]
              }));
              marker.setContent(div);
            }
            // position: itemdata.data.base.position,
            // content: this.InitBaseDom(itemdata, zoomdata)
          };
          return options;
        },
        // 更新缩放基本窗口
        FuncDom: function (act, mapitemdata) {
          let basedom = mapitemdata.getContent();
          if (act == 'update') {
            let itemdata = mapitemdata.getExtData();
            let nexticon = _formatType.GetIcon('car', {
              maintype: itemdata.data.base.maintype.prop,
              carstatus: itemdata.data.base.carstatus.prop,
              workstatus: itemdata.data.base.workstatus.prop
            });
            let img = basedom.getElementsByTagName('img')[0];
            if (nexticon.src != itemdata.data.base.icon.src) {
              itemdata.data.base.icon = nexticon;
              let p = basedom.getElementsByTagName('p')[0];
              p.innerHTML = itemdata.data.base.icon.name;
              img.src = itemdata.data.base.icon.src;
            }
            img.style.transform = `rotate(${itemdata.data.base.angle}deg)`;
          } else if (act == 'zoom') {
            let itemscale = this.GetScale(this.mapfunc.GetZoomData().current);
            basedom.style.transform = `scale(${itemscale})`;
          }
        },
        // 加载详情数据
        LoadDetailData: function (itemdata) {
          return new Promise((resolve, reject) => {
            let postdata = {
              mapMark: '1',
              vehId: itemdata.data.base.id,
              vinCode: itemdata.data.base.vincode
            };
            _func.post('/locate/getVehicleInfo', postdata, 'token').then(res => {
              itemdata.data.detail = {
                address: res.data.address,
                direction: res.data.direction,
                powernum: res.data.fuelCapacity,
                imgsrc: res.data.imageUrl,
                powertype: _formatType.GetType('car', {
                  target: 'powertype',
                  data: res.data.vehFuelType
                }),
                // detailName: res.data.useTypeName,
                time: res.data.positionTime,
                speed: res.data.speed
                // useTypeName: res.data.useTypeName,
                // vehCode: res.data.vehCode,
                // vehId: res.data.vehId,
                // vehicleStatus: res.data.vehicleStatus
              };
              resolve(res);
            }, res => {
              reject(res);
            });
          });
        },
        // 更新详情窗口
        FuncDomToPopup(act, itemdata) {
          let popupprogram = itemdata.program.popup;
          let popupdom = popupprogram.getContent();
          if (act == 'update') {
            popupdom.getElementsByClassName('js_img')[0].src = itemdata.data.detail.imgsrc ? itemdata.data.detail.imgsrc : '/images/carempty.png';
            popupdom.getElementsByClassName('js_address')[0].innerHTML = itemdata.data.detail.address;
            popupdom.getElementsByClassName('js_speed')[0].innerHTML = itemdata.data.detail.speed + ' km/h';
            popupdom.getElementsByClassName('js_direction')[0].innerHTML = itemdata.data.detail.direction;
            popupdom.getElementsByClassName('js_powernum')[0].innerHTML = itemdata.data.detail.powernum;
            popupdom.getElementsByClassName('js_status')[0].innerHTML = `
              <span style='color: ${itemdata.data.base.workstatus.color}' >${itemdata.data.base.workstatus.name}</span>
              <span>/</span>
              <span style='color: ${itemdata.data.base.carstatus.color}' >${itemdata.data.base.carstatus.name}</span>
            `.trim();
            popupdom.getElementsByClassName('js_time')[0].innerHTML = itemdata.data.detail.time;
          } else if (act == 'baseupdate') {
            popupprogram.setPosition(itemdata.program.main.getPosition());
          }
        },
        // 按照需要的顺序添加到数据中
        FuncPushItem(item) {
          for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].data.base.workstatus.prop == item.data.base.workstatus.prop) {
              this.list.splice(i, 0, item);
              return true;
            }
          }
          this.list.push(item);
          return true;
        },
        BuildOtherList() {
          this.FormatOtherData('init', {
            offsetlist: this.list
          });
        },
        FuncTimeByUpdating(payload) {
          this.FormatOtherData('basechange', payload);
        },
        FuncTimeByUpdate(payload) {
          this.FormatOtherData('update', payload);
        },
        // 格式化其他的数组
        FormatOtherData(act, payload) {
          if (act == 'init' || act == 'update') {
            if (act == 'init') {
              this.data.onlinelist = [];
              this.data.offlinelist = [];
            }
            for (let i = 0; i < payload.offsetlist.length; i++) {
              if (payload.offsetlist[i].data.base.carstatus.prop != 'offline') {
                this.data.onlinelist.push(payload.offsetlist[i]);
              } else {
                this.data.offlinelist.push(payload.offsetlist[i]);
              }
            }
          } else if (act == 'basechange') {
            let oldoff = payload.itemdata.data.base.carstatus.prop == 'offline';
            let newoff = payload.newdata.data.base.carstatus.prop == 'offline';
            if (oldoff != newoff) {
              if (oldoff != 'offline') {
                this.FuncListByAct('del', this.data.onlinelist, payload.itemdata);
                this.data.offlinelist.push(payload.itemdata);
              } else {
                this.FuncListByAct('del', this.data.offlinelist, payload.itemdata);
                this.data.onlinelist.push(payload.itemdata);
              }
            }
          }
        },
        GetItemByBaseProp(prop, target) {
          for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].data.base[prop] == target) {
              return this.list[i].data.base;
            }
          }
          return false;
        }
      }
    }),
    trash: new _markitem({
      name: 'trash',
      list: [],
      position: {
        target: 'detail'
      },
      data: {
        buildtype: 'total'
      },
      type: {
        data: 'total'
      },
      events: {
        mod: {
          type: 'cover',
          data: {
            zoom: {
              data: 'do'
            },
            update: {
              data: 'do'
            },
            popup: {
              data: 'do'
            }
          }
        },
        list: {
          click: { // 基本对象的点击事件
            type: 'add',
            list: ['FuncDefaultBaseEventByAct']
          }
        }
      },
      next: {// 定时器设置，更新需要的
        func: '',
        start: 10000,
        time: 10000
      },
      methods: {
        // 加载基本数据的接口
        LoadData: function (act) {
          return new Promise((resolve, reject) => {
            let postdata = {
              'facType': 'trash'
            };
            _func.post('/facility/list', postdata, 'token').then(res => {
              let list = this.FuncFormatList(act, res.data);
              resolve({
                status: 'success',
                list: list
              });
            }, res => {
              reject(res);
            });
          });
        },
        // 加载基本数据的接口
        LoadUpdateData: function (act) {
          return new Promise((resolve, reject) => {
            _func.post('/trash/states', {
              type: 0
            }, 'token').then(res => {
              let list = this.FuncFormatList(act, res.data);
              resolve({
                status: 'success',
                list: list
              });
            }, res => {
              reject(res);
            });
          });
        },
        FuncEventsMod(act) {
          this.data.buildtype = act;
          if (act == 'base') {
            this.events.FuncMod('reset', {
              act: act,
              list: ['update', 'popup']
            });
          } else if (act == 'distribution') {
            this.events.FuncMod('reset', {
              act: 'base',
              list: ['update', 'popup']
            });
          } else {
            this.events.FuncMod('reset', {
              act: act
            });
          }
        },
        // 格式化基本数据
        FuncFormatData: function (act, itemdata, resitem) {
          if (act == 'init') {
            itemdata.data.base = {
              id: resitem.id,
              status: _formatType.GetDeviceType('trash', {
                target: 'status',
                data: resitem.status
              }),
              laststatus: null
            }
            itemdata.data.detail = {
              name: resitem.facName,
              type: resitem.facType,
              address: resitem.address,
              typename: resitem.facTypeName,
              orgname: resitem.deptName,
              imgid: resitem.imageId,
              imgname: resitem.imageName,
              imgsrc: resitem.imageUrl,
              trashCount: resitem.trashCount,
              collectTimeList: resitem.collectTimeList,
              position: [Number(resitem.longitude), Number(resitem.latitude)],
              createtimestamp: resitem.createTime * 1000,
              createtime: _func.TimestampToStr(resitem.createTime * 1000),
              remark: resitem.remark
            }
          } else if (act == 'update') {
            itemdata.data.base = {
              id: resitem.id,
              status: _formatType.GetDeviceType('trash', {
                target: 'status',
                data: resitem.status
              })
            }
            // if (_func.getrandom(1,2) ==1 ) {
            //   itemdata.data.base.status.prop = 'finished';
            // } else {
            //   itemdata.data.base.status.prop = 'unfinished';
            // }
            itemdata.data.detail = {
            }
          }
        },
        FuncOptions(itemdata) {
          let options = {
            position: itemdata.data[this.position.target].position,
            content: document.createElement('div')
          };
          let itemscale = this.GetScale(this.mapfunc.GetZoomData().current);
          let icon;
          if (this.data.buildtype == 'total') {
            icon = formatType.GetDeviceIcon('trash', itemdata.data.base.status.prop);
          } else if (this.data.buildtype == 'base') {
            icon = formatType.GetDeviceIcon('trash');
          } else if (this.data.buildtype == 'distribution') {
            icon = formatType.GetDeviceIcon('trash', itemdata.data.base.distribution.prop);
          }
          let height = 40;
          options.content.innerHTML = `
            <img style=' height: ${height}px; ' src='${icon}' />
          `.trim();
          options.content.style.position = 'relative';
          options.content.style.transform = `scale(${itemscale})`;
          return options;
        },
        
        FuncOptionsToPopup(itemdata) {
          let options = {
            isCustom: true, // 使用自定义窗体
            autoMove: false, // 是否自动调整窗体到视野内
            content: this.FuncGetPopupDom(itemdata),
            offset: _plugin.FuncMod('pixel', {
              options: [10, -30]
            })
          };
          return options;
        },
        // 加载详情窗口
        FuncGetPopupDom(itemdata) {
          let popupdom = document.createElement('div');
          let timelisthtml = `
            <div class='mappop_list'>
              <div class='mappop_item' style="display:contents">
                <div class='mappop_itemtitle'>
                  <p class='mappop_itemname'>收运时间 :</p>
                </div>
                <div class='mappop_itemcontent' style="display:block">`;
          if (itemdata.data.detail.collectTimeList && itemdata.data.detail.collectTimeList.length > 0) {
            for (let i = 0; i < itemdata.data.detail.collectTimeList.length; i++) {
              timelisthtml += `<p>${itemdata.data.detail.collectTimeList[i]}</p>`;
            }
          } else {
            timelisthtml += `<p>无</p>`;
          }
          timelisthtml += `</div>
            </div>
          </div>`;
          popupdom.innerHTML = `
              <div class='mappop_div'>
              <div class='mappop_fixmenu mappop_link js_close ' >
                <p class='mappop_fixmenuicon'><i class='el-icon-close'></i></p>
              </div>
              <div class='mappop_title'>
                <p class="mappop_onlyline mappop_withclose">垃圾桶 (${itemdata.data.detail.name})</p>
              </div>
              <div class='mappop_img'>
                <img class='js_img' src='${itemdata.data.detail.imgsrc ? itemdata.data.detail.imgsrc : '/images/carempty.png'}' />
              </div>
              <div class='mappop_area'>
                <div class='mappop_list mappop_border'>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemicon'><i class='el-icon-location'></i></p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_address'>${itemdata.data.detail.address}</p>
                    </div>
                  </div>
                </div>
                <div class='mappop_list'>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemname'>设施类型</p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class=''>${itemdata.data.detail.typename}</p>
                    </div>
                  </div>
                  <div class="mappop_item">
                    <div class="mappop_itemtitle">
                      <p class="mappop_itemname">设施状态：</p>
                    </div>
                    <div class="mappop_itemcontent">
                      <p class="js_status">${itemdata.data.base.status.name}</p>
                    </div>
                  </div>
                </div>
                <div class='mappop_list'>
                  <div class='mappop_item'>
                    <div class='mappop_itemtitle'>
                      <p class='mappop_itemname'>收运次数:</p>
                    </div>
                    <div class='mappop_itemcontent'>
                      <p class='js_time'>${itemdata.data.detail.trashCount ? itemdata.data.detail.trashCount : 0}</p>
                    </div>
                  </div>
                </div>
                ${timelisthtml}
              </div>
              <div class='mappop_angeldiv'>
                <div class='mappop_angel'></div>
              </div>
            </div>
          `.trim();
          popupdom.getElementsByClassName('js_close')[0].onclick = () => {
            this.FuncPopupAct('close', itemdata);
          }
          return popupdom;
        },
        // 更新缩放基本窗口
        FuncDom: function (act, mapitemdata) {
          // console.log(act)
          let basedom = mapitemdata.getContent();
          if (act == 'update') {
            let itemdata = mapitemdata.getExtData();
            if (itemdata.data.base.status.prop != itemdata.data.base.laststatus.prop) {
              let nexticon = formatType.GetDeviceIcon('trash', itemdata.data.base.status.prop);
              let img = basedom.getElementsByTagName('img')[0];
              img.src = nexticon;
            }
          } else if (act == 'zoom') {
            if (this.data.buildtype == 'distribution') {
              this.FuncCurrentDom('zoom', mapitemdata, basedom);
            } else {
              let itemscale = this.GetScale(this.mapfunc.GetZoomData().current);
              basedom.style.transform = `scale(${itemscale})`;
            }
          }
        },
        // 加载详情数据
        LoadDetailData: function (itemdata) {
          return new Promise((resolve, reject) => {
            _func.get('/facility/' + itemdata.data.base.id, {}, 'token').then(res => {
              itemdata.data.detail = {
                name: res.data.facName,
                type: res.data.facType,
                address: res.data.address,
                typename: res.data.facTypeName,
                orgname: res.data.deptName,
                imgid: res.data.imageId,
                imgname: res.data.imageName,
                imgsrc: res.data.imageUrl,
                position: [Number(res.data.longitude), Number(res.data.latitude)],
                createtimestamp: res.data.createTime * 1000,
                createtime: _func.TimestampToStr(res.data.createTime * 1000),
                remark: res.data.remark,
                trashCount: res.data.trashCount,
                collectTimeList: res.data.collectTimeList
              };
              resolve(res);
            }, res => {
              reject(res);
            });
          });
        },
        // 更新详情窗口
        FuncDomToPopup(act, itemdata) {
          let popupprogram = itemdata.program.popup;
          let popupdom = popupprogram.getContent();
          if (act == 'update') {
            popupdom.getElementsByClassName('js_img')[0].src = itemdata.data.detail.imgsrc ? itemdata.data.detail.imgsrc : '/images/carempty.png';
            popupdom.getElementsByClassName('js_status')[0].innerHTML = itemdata.data.base.status.name;
          } else if (act == 'baseupdate') {
            popupprogram.setPosition(itemdata.program.main.getPosition());
          }
        },
        FuncUpdateItemNext(itemdata, newdata) {
          itemdata.data.base.laststatus = _func.copyjson(itemdata.data.base.status);
          itemdata.data.base.status = _func.copyjson(newdata.data.base.status);
        },
        FuncPushNew(newdata) {
          let item = this.GetFormatData();
          newdata.status = 'unfinished';
          this.FuncFormatData('init', item, newdata);
          item.load.base = 'success';
          item.load.detail = 'success';
          this.FuncBuild(item);
          this.list.push(item);
        },
        GetDistribution: function () {
          return new Promise((resolve, reject) => {
            _func.post('/trash/states', {
              type: 1
            }, 'token').then(res => {
              let newlist = res.data;
              for (let i = 0; i < newlist.length; i++) {
                for (let n = 0; n < this.list.length; n++) {
                  if (this.list[n].data.base.id == newlist[i].id) {
                    this.list[n].data.base.distribution = _formatType.GetDeviceType('trash', {
                      target: 'distribution',
                      data: newlist[i].status
                    });
                    newlist.splice(i, 0);
                    break;
                  }
                }
              }
              resolve({
                status: 'success'
              });
            }, res => {
              reject(res);
            });
          });
        },
        FuncCurrentDom(act, mapitemdata, basedom) {
          let itemdata = mapitemdata.getExtData();
          if (act == 'reicon') {
            let icon;
            if (!itemdata.data.base.choice) {
              icon = formatType.GetDeviceIcon('trash', itemdata.data.base.distribution.prop);
            } else {
              icon = formatType.GetDeviceIcon('trash', 'choice');
            }
            let img = basedom.getElementsByTagName('img')[0];
            img.src = icon;
          } else if (act == 'zoom') {
            let itemscale = this.GetScale(this.mapfunc.GetZoomData().current);
            let rate = itemdata.data.base.choice ? 1.2 : 1;
            itemscale = itemscale * rate;
            basedom.style.transform = `scale(${itemscale})`;
          }
        },
        FuncCurrent(act, data) {
          let self = this;
          function doit() {
            let basedom = this.getContent();
            let itemdata = this.getExtData();
            // _func.showjson(itemdata.data);
            if (!itemdata.data.base.choice) {
              data.callback('add', itemdata);
              itemdata.data.base.choice = true;
            } else {
              itemdata.data.base.choice = false;
              data.callback('del', itemdata);
            }
            self.FuncCurrentDom('reicon', this, basedom);
            self.FuncCurrentDom('zoom', this, basedom);
          }
          if (act == 'build') {
            let map;
            for (let i = 0; i < this.list.length; i++) {
              if (this.list[i].data.base.distribution.prop == 'unallocated' && this.list[i].program.main) {
                // if (this.list[i].data.base.iid == 'new') {
                //   this.list[i].data.base.choice = true;
                //   let basedom = this.list[i].program.main.getContent();
                //   this.FuncCurrentDom('reicon', this.list[i].program.main, basedom);
                //   this.list[i].program.main.on('click', () => {
                //     console.log(11111);
                //   });
                // } else {
                //   map = this.list[i].program.main.getMap();
                // }
                this.list[i].program.current = AMap.event.addListener(this.list[i].program.main, "click", doit);
                if (!this.list[i].data.base.choice) {
                  this.list[i].data.base.choice = false;
                } else {
                  this.list[i].data.base.choice = false;
                  doit.call(this.list[i].program.main);
                }
              }
            }
            this.FuncCurrent('hide');
          } else if (act == 'hide') {
            for (let i = 0; i < this.list.length; i++) {
              if (!this.list[i].data.base.choice && this.list[i].data.base.distribution.prop == 'allocated' && this.list[i].program.main) {
                this.list[i].program.main.hide();
              }
            }
          } else if (act == 'show') {
            for (let i = 0; i < this.list.length; i++) {
              if (!this.list[i].data.base.choice && this.list[i].data.base.distribution.prop == 'allocated' && this.list[i].program.main) {
                this.list[i].program.main.show();
              }
            }
          } else if (act == 'reset') {
            for (let i = 0; i < data.list.length; i++) {
              data.list[i].data.base.choice = false;
              if (data.list[i].program.main) {
                let basedom = data.list[i].program.main.getContent();
                this.FuncCurrentDom('reicon', data.list[i].program.main, basedom);
                this.FuncCurrentDom('zoom', data.list[i].program.main, basedom);
              }
            }
          } else if (act == 'change') {
            for (let i = 0; i < data.list.length; i++) {
              data.list[i].data.base.choice = false;
              data.list[i].data.base.distribution = _formatType.GetDeviceType('trash', {
                target: 'distribution',
                data: 'allocated'
              });
              if (data.list[i].program.main) {
                let basedom = data.list[i].program.main.getContent();
                this.FuncCurrentDom('reicon', data.list[i].program.main, basedom);
                this.FuncCurrentDom('zoom', data.list[i].program.main, basedom);
                if (data.show != 'show') {
                  data.list[i].program.main.hide();
                }
              }
              if (data.list[i].program.current) {
                AMap.event.removeListener(data.list[i].program.current);
                data.list[i].program.current = false;
              }
            }
          } else if (act == 'edit') {
            for (let n = 0; n < this.list.length; n++) {
              for (let i = 0; i < data.length; i++) {
                if (data[i] == this.list[n].data.base.id) {
                  this.list[n].data.base.distribution = _formatType.GetDeviceType('trash', {
                    target: 'distribution',
                    data: 'unallocated'
                  });
                  this.list[n].data.base.choice = true;
                  data.splice(i, 1);
                  break;
                }
              }
            }
          } else if (act == 'destroy') {
            for (let i = 0; i < this.list.length; i++) {
              this.list[i].data.base.choice = false;
              if (this.list[i].program.current) {
                AMap.event.removeListener(this.list[i].program.current);
                this.list[i].program.current = false;
              }
            }
          }
        }
      }
    }),
    road: new _lineitem({
      name: 'road',
      list: [],
      data: {
        type: {
          unwork: {
            color: "#E55300",
            title: "未作业"
          },
          clean: {
            color: "#003FE2",
            title: "已清扫"
          },
          water: {
            color: "#5CDFFF",
            title: "已洒水"
          },
          total: {
            color: "#00FF00",
            title: "全作业"
          }
        }
      },
      type: {
        data: 'total'
      },
      events: {
        mod: {
          type: 'cover',
          data: {
            update: {
              data: 'do'
            }
          }
        },
        list: {
          // click: { // 基本对象的点击事件
          //   type: 'add',
          //   list: ['FuncDefaultBaseEventByAct']
          // }
        }
      },
      next: {// 定时器设置，更新需要的
        func: '',
        start: 10000,
        time: 10000
      },
      methods: {
        GetList(type = 'total', name) {
          let typearr = [];
          if (type == 'total') {
            typearr = ['single', 'double'];
          } else {
            typearr.push(type);
          }
          let list = [];
          for (let i = 0; i < this.list.length; i++) {
            if (typearr.indexOf(this.list[i].data.detail.type.prop) > -1) {
              if (!name) {
                list.push(this.list[i]);
              } else {
                if (this.list[i].data.detail.name.indexOf(name) > -1) {
                  list.push(this.list[i]);
                }
              }
            }
          }
          return list;
        },
        DelList(list) {
          for (let i = 0; i < list.length; i++) {
            this.DelItem(list[i]);
          }
        },
        FuncPushNew(newdata) {
          let item = this.GetFormatData();
          this.FuncFormatData('init', item, newdata);
          item.load.base = 'success';
          item.load.detail = 'success';
          this.FuncBuild(item);
          this.list.push(item);
        },
        FuncEventsMod(act) {
          this.data.buildtype = act;
          if (act == 'base') {
            this.events.FuncMod('reset', {
              act: act,
              list: ['update']
            });
          } else {
            this.events.FuncMod('reset', {
              act: act
            });
          }
        },
        // 加载基本数据的接口
        LoadData: function (act) {
          return new Promise((resolve, reject) => {
            let postdata = {};
            _func.post('/jobRoad/list', postdata, 'token').then(res => {
              let list = this.FuncFormatList(act, res.data);
              resolve({
                status: 'success',
                list: list
              });
            }, res => {
              reject(res);
            });
          });
        },
        // 加载基本数据的接口
        LoadUpdateData: function (act) {
          return new Promise((resolve, reject) => {
            let postdata = {};
            _func.post('/jobRoad/states', postdata, 'token').then(res => {
            // _func.post('http://10.1.5.138:8000/baJobCompletion/getRoadStatus', postdata, 'token').then(res => {
              // console.log(res);
              // if (maindatadata) {
              //   for (let n = 0; n < maindatadata.length; n++) {
              //     let mainlist = maindatadata[n].gpsStatus[0].split(';');
              //     let newlist = res.data[n].gpsStatus[0].split(';');
              //     for (let i = 0; i < mainlist.length; i++) {
              //       if (mainlist[i] != newlist[i]) {
              //         console.log(maindatadata[n].status, mainlist[i], newlist[i]);
              //       }
              //     }
              //   }
              //   maindatadata = res.data;
              // } else {
              //   maindatadata = res.data;
              // }

              let list = this.FuncFormatList(act, res.data);
              resolve({
                status: 'success',
                list: list
              });
            }, res => {
              reject(res);
            });
          });
        },
        FuncSetPathList(workstatus, pathlist) {
          let list = [];
          for (let i = 0; i < pathlist.length; i++) {
            if (pathlist[i]) {
              let item = pathlist[i].split(",");
              let newitem = {
                position: [item[0], item[1]]
              };
              if (workstatus == 'clean') {
                newitem.status = item[2] + '0';
              } else if (workstatus == 'water') {
                newitem.status = '0' + item[2];
              } else if (workstatus == 'total') {
                if (!item[3]) {
                  newitem.status = item[2] + item[2];
                } else {
                  newitem.status = item[2] + item[3];
                }
              } else {
                newitem.status = '00';
              }
              list.push(newitem);
            }
          }
          return list;
        },
        FuncGetPathList(workstatus, pathdata) {
          let path = {
            default: this.FuncSetPathList(workstatus, pathdata[0].split(';'))
          };
          if (pathdata[1]) {
            path.back = this.FuncSetPathList(workstatus, pathdata[1].split(';'))
          }
          return path;
        },
        FuncWorkStatus(act, data) {
          if (act == 'get') {
            if (data == 'water') {
              return 'water';
            } else if (data == 'clean') {
              return 'clean';
            } else if (data == 'water,clean') {
              return 'total';
            } else if (data == 'whole') {
              return 'total';
            } else {
              return '';
            }
          }
        },
        // 格式化基本数据
        FuncFormatData: function (act, itemdata, resitem) {
          let statustarget = {
            unfinished: 'unwork',
            working: 'working',
            finished: 'worked'
          };
          if (act == 'init') {
            itemdata.data.base = {
              id: resitem.id,
              status: statustarget[resitem.status],
              laststatus: ''
            }
            // console.log(resitem.jobType);
            itemdata.data.detail = {
              name: resitem.roadName,
              orgname: resitem.deptName,
              workstatus: this.FuncWorkStatus('get', resitem.jobType),
              originpath: {},
              type: {
                name: resitem.laneTypeName,
                prop: resitem.laneType
              },
              startpoint: {
                description: resitem.startName,
                lng: resitem.startLong,
                lat: resitem.startLat
              },
              endpoint: {
                description: resitem.endName,
                lng: resitem.endLong,
                lat: resitem.endLat
              },
              width: resitem.roadWidth,
              size: resitem.roadLength,
              offset: resitem.gpsOffset,
              remark: resitem.remark
            }
            // if (itemdata.data.base.id == 'ca373ce84c4d4931b032688e8d332ff1') {
            //   _func.showjson({ data: resitem.gpsFeatures });
            // }
            itemdata.data.detail.originpath = this.FuncGetPathList(itemdata.data.detail.workstatus, resitem.gpsFeatures);
          } else if (act == 'update') {
            itemdata.data.base = {
              id: resitem.id,
              status: statustarget[resitem.status]
            }
            // if (itemdata.data.base.id == 'ca373ce84c4d4931b032688e8d332ff1') {
            //   _func.showjson({ data: resitem.gpsFeatures });
            // }
            if (resitem.status == 'working') {
              itemdata.data.detail = {
                originpath: resitem.gpsStatus
              }
            }
          }
        },
        FuncFormatPath: function (itemdata) {
          let target, type;
          // true 已完成 false 未完成
          if (itemdata.data.base.status == 'working') {
            target = ['00', '11', '01', '10'];
            type = 'check';
          } else if (itemdata.data.base.status == 'unwork') {
            target = '00';
            type = 'set';
          } else if (itemdata.data.base.status == 'worked') {
            if (itemdata.data.detail.workstatus == 'clean') {
              target = '10';
            } else if (itemdata.data.detail.workstatus == 'water') {
              target = '01';
            } else if (itemdata.data.detail.workstatus == 'total') {
              target = '11';
            } else {
              target = '00';
            }
            type = 'set';
          }
          // console.log(itemdata.data.base.status, itemdata.data.detail.workstatus, target, type);
          let roadoptions = {
            options: {
              type: type,
              prop: ['status'],
              target: target
            },
            res: {
              list: {
                type: 'string',
                prop: ['position']
              }
            }
          };
          let defaultroaddata = new _linedata(roadoptions);
          for (let i = 0; i < itemdata.data.detail.originpath.default.length; i++) {
            defaultroaddata.PushData(itemdata.data.detail.originpath.default[i]);
          }
          itemdata.data.detail.path = defaultroaddata.GetData();
          // console.log(itemdata.data.detail.path);
          if (itemdata.data.detail.originpath.back) {
            let backroaddata = new _linedata(roadoptions);
            for (let i = 0; i < itemdata.data.detail.originpath.back.length; i++) {
              backroaddata.PushData(itemdata.data.detail.originpath.back[i]);
            }
            let backpath = backroaddata.GetData();
            itemdata.data.detail.path.list = itemdata.data.detail.path.list.concat(backpath.list);
          }
        },
        FuncOptions(pathdata) {
          let options = {
            path: pathdata.list,
            strokeWeight: 2,
            borderWeight: 2,
            zIndex: 110,
            lineJoin: 'round' // 折线拐点连接处样式
          };
          if (this.data.buildtype == 'base') {
            options.strokeColor = 'rgba(0,255,0,0.5)';
          } else {
            if (pathdata.type == '10') {
              options.strokeColor = this.data.type.clean.color;
            } else if (pathdata.type == '01') {
              options.strokeColor = this.data.type.water.color;
            } else if (pathdata.type == '11') {
              options.strokeColor = this.data.type.total.color;
            } else {
              if (pathdata.type != '00') {
                console.log('错误:此处type值未预期');
              }
              options.strokeColor = this.data.type.unwork.color;
            }
          }
          return options;
        },
        // 加载详情数据
        LoadDetailData: function (itemdata) {
          return new Promise((resolve, reject) => {
            let postdata = {};
            _func.get('/jobRoad/' + itemdata.data.base.id, {}, 'token').then(res => {
              this.FuncFormatData('init', itemdata, res.data);
              resolve({
                status: 'success'
              });
            }, res => {
              reject(res);
            });
          });
        },
        FuncUpdateItemNext(itemdata, newdata) {
          itemdata.data.base.laststatus = itemdata.data.base.status;
          itemdata.data.base.status = newdata.data.base.status;
          if (itemdata.data.base.status == 'working') {
            itemdata.data.detail.originpath = this.FuncGetPathList(itemdata.data.detail.workstatus, newdata.data.detail.originpath);
          }
        }
      }
    })
  }
};

moddata.PushOtherDevice = function (list) {
  for (let i = 0; i < list.length; i++) {
    let targetmod = _formatType.GetDevice('prop', list[i]);
    this.init.data.list.push({
      name: targetmod.prop,
      act: 'total'
    });
    this.data[targetmod.prop] = new _markitem({
      name: targetmod.prop,
      list: [],
      position: {
        target: 'detail'
      },
      data: {
      },
      type: {
        data: 'total'
      },
      events: {
        mod: {
          type: 'cover',
          data: {
            zoom: {
              data: 'do'
            }
          }
        },
        list: {
        }
      },
      methods: {
        FuncEventsMod(act) {
          this.data.buildtype = act;
          // if (act == 'base') {
          //   this.events.FuncMod('reset', {
          //     act: act,
          //     list: ['zoom']
          //   });
          // } else {
          //   this.events.FuncMod('reset', {
          //     act: act
          //   });
          // }
        },
        // 加载基本数据的接口
        LoadData: function (act) {
          return new Promise((resolve, reject) => {
            let postdata = {
              'facType': targetmod.prop
            };
            _func.post('/facility/list', postdata, 'token').then(res => {
              let list = this.FuncFormatList(act, res.data);
              resolve({
                status: 'success',
                list: list
              });
            }, res => {
              reject(res);
            });
          });
        },
        // 格式化基本数据
        FuncFormatData: function (act, itemdata, resitem) {
          if (act == 'init') {
            itemdata.data.base = {
              id: resitem.id
            }
            itemdata.data.detail = {
              name: resitem.facName,
              type: resitem.facType,
              address: resitem.address,
              typename: resitem.facTypeName,
              orgname: resitem.deptName,
              imgid: resitem.imageId,
              imgname: resitem.imageName,
              imgsrc: resitem.imageUrl,
              position: [Number(resitem.longitude), Number(resitem.latitude)],
              createtimestamp: resitem.createTime * 1000,
              createtime: _func.TimestampToStr(resitem.createTime * 1000),
              remark: resitem.remark
            }
          }
        },
        FuncOptions(itemdata) {
          let options = {
            position: itemdata.data[this.position.target].position,
            content: document.createElement('div')
          };
          let itemscale = this.GetScale(this.mapfunc.GetZoomData().current);

          let icon = formatType.GetDeviceIcon(targetmod.prop);
          let height = 40;
          options.content.innerHTML = `
            <img style=' height: ${height}px; ' src='${icon}' />
          `.trim();
          options.content.style.position = 'relative';
          options.content.style.transform = `scale(${itemscale})`;
          return options;
        },
        FuncOptionsToPopup(itemdata) {
          let options = {
            isCustom: true, // 使用自定义窗体
            autoMove: false, // 是否自动调整窗体到视野内
            content: this.FuncGetPopupDom(itemdata),
            offset: _plugin.FuncMod('pixel', {
              options: [10, -30]
            })
          };
          return options;
        },
        // 更新缩放基本窗口
        FuncDom: function (act, mapitemdata) {
          // console.log(act)
          let basedom = mapitemdata.getContent();
          if (act == 'update') {
            let itemdata = mapitemdata.getExtData();
            if (itemdata.data.base.status.prop != itemdata.data.base.laststatus.prop) {
              let nexticon = formatType.GetDeviceIcon('trash', itemdata.data.base.status.prop);
              let img = basedom.getElementsByTagName('img')[0];
              img.src = nexticon;
            }
          } else if (act == 'zoom') {
            let itemscale = this.GetScale(this.mapfunc.GetZoomData().current);
            basedom.style.transform = `scale(${itemscale})`;
          }
        },
        // 加载详情数据
        LoadDetailData: function (itemdata) {
          return new Promise((resolve, reject) => {
            _func.get('/facility/' + itemdata.data.base.id, {}, 'token').then(res => {
              itemdata.data.detail = {
                name: res.data.facName,
                type: res.data.facType,
                address: res.data.address,
                typename: res.data.facTypeName,
                orgname: res.data.deptName,
                imgid: res.data.imageId,
                imgname: res.data.imageName,
                imgsrc: res.data.imageUrl,
                position: [Number(res.data.longitude), Number(res.data.latitude)],
                createtimestamp: res.data.createTime * 1000,
                createtime: _func.TimestampToStr(res.data.createTime * 1000),
                mark: res.data.remark
              };
              resolve(res);
            }, res => {
              reject(res);
            });
          });
        },
        FuncPushNew(newdata) {
          let item = this.GetFormatData();
          this.FuncFormatData('init', item, newdata);
          item.load.base = 'success';
          item.load.detail = 'success';
          this.FuncBuild(item);
          this.list.push(item);
        },
        FuncUpdateItemNext(itemdata, newdata) {

        }
      }
    })
  }
}

moddata.FuncLoad = function (mapfunc, initlist) {
  let isload = 0;
  if (!initlist) {
    initlist = this.init.data.list;
  }
  for (let i = 0; i < initlist.length; i++) {
    let mod = initlist[i];
    if (this.data[mod.name].load.base.data == 'success' && !this.init.load[mod.name]) {
      this.init.load[mod.name] = 'loading';
      if (mod.act && this.data[mod.name].FuncEventsMod) {
        this.data[mod.name].FuncEventsMod(mod.act);
      }
      this.data[mod.name].FuncAct('init', mapfunc, mod.hide);
      mapfunc.InitZoom(() => {
        this.data[mod.name].ResetZoom();
      });
      this.data[mod.name].ResetZoom();
      // if (mod.hide == 'hide') {
      //   this.data[mod.name].FuncAct('hide');
      // }
      this.init.load[mod.name] = 'success';
    }
    if (this.init.load[mod.name] == 'success') {
      isload++;
    }
  }
  if (isload >= initlist.length) {
    return true;
  } else {
    return false;
  }
}

moddata.FuncAct = function (act, data) {
  if (act == 'show') {
    for (let i = 0; i < this.init.data.list.length; i++) {
      let mod = this.init.data.list[i];
      if (this.init.load[mod.name]) {
        if (data.list.indexOf('total') > -1 || data.list.indexOf(mod.name) > -1) {
          if (!this.data[mod.name].status.show) {
            this.data[mod.name].FuncAct('show');
          }
        } else {
          if (this.data[mod.name].status.show) {
            this.data[mod.name].FuncAct('hide');
          }
        }
      }
    }
  } else if (act == 'destroy') {
    for (let i = 0; i < this.init.data.list.length; i++) {
      let mod = this.init.data.list[i];
      if (this.init.load[mod.name]) {
        this.data[mod.name].FuncAct('destroy');
        this.init.load[mod.name] = '';
      }
    }
  }
}

moddata.PushOtherDevice(_device.GetList('other'));

export default moddata;