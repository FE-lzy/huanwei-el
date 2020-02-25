<style scoped lang="scss">
@import "@/localstyles/element.scss";
.build {
  @include baseeditarea();
}
.middlebtn{
  font-size: 1px;
  .el-form-item__content{
    margin-left: 0 !important;
    margin: 0 auto;
  }
}
</style>
<template>
  <div class="build">
    <div class="menuarea">
      <div class="title">
        <h4>信息录入</h4>
      </div>
      <div class="mainarea">
        <el-form
          ref="buildform"
          :model="build.data"
          :rules="build.rules"
          label-width="80px"
          class="buildform"
          :validate-on-rule-change="false"
        >
          <el-form-item label="单位名称">
            <p>{{ moddata.maindata.organization }}</p>
          </el-form-item>
          <el-form-item label="道路名称" prop="name">
            <el-input v-model="build.data.name" placeholder="请输入..." />
          </el-form-item>
          <el-form-item label="车道类型" prop="type">
            <el-select v-model="build.data.type" placeholder="请选择车道类型" @change="FuncTypeChange">
              <el-option
                v-for="val in _mainmod.formatType.mod.road.dictionary.type"
                :key="val.name"
                :label="val.name"
                :value="val.prop"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="路线起点" prop="start">
            <el-input v-model="build.data.start" placeholder="请在地图选择" :disabled="true" />
          </el-form-item>
          <el-form-item label="路线终点" prop="end">
            <el-input v-model="build.data.end" placeholder="请在地图选择" :disabled="true" />
          </el-form-item>
          <el-form-item label="路线长度" prop="size">
            <el-input v-model="build.data.size" placeholder="" :disabled="true">
              <p slot="suffix">m</p>
            </el-input>
          </el-form-item>
          <el-form-item label="道路宽度" prop="width">
            <el-input v-model="build.data.width" type="tel" placeholder="道路宽度" :disabled="false">
              <p slot="suffix">m</p>
            </el-input>
          </el-form-item>
          <el-form-item label="偏移阈值" prop="offset">
            <el-input v-model="build.data.offset" type="tel" placeholder="道路偏移阈值" :disabled="false">
              <p slot="suffix">m</p>
            </el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="build.data.remark" type="textarea" />
          </el-form-item>
          <el-form-item class="middlebtn">
            <el-button type="primary" @click="PostData('buildform')">提交</el-button>
            <!-- <el-button @click="ClearTemp()">重置</el-button> -->
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="maparea">
      <div class="title">
        <h4>路线绘制</h4>
        <div class="subtitle">
          <p v-if="build.data.start" style="color: #4fd7a7" @click="ResetRoad()">重新绘制</p>
          <p v-else>鼠标左键获取定位点</p>
        </div>
      </div>
      <div class="mainarea">
        <div class="mapin">
          <div class="mapfixarea menutypearea">
            <div class="mapfixmenu">
              <el-radio v-model="build.menu.type" label="description">按地理位置</el-radio>
              <el-radio v-model="build.menu.type" label="lnglat">按经纬度</el-radio>
            </div>
            <div class="mapfixinput">
              <div v-show="build.menu.type=='description'" class="mapfixinputin">
                <div class="inputitem">
                  <input
                    ref="mapinput"
                    class="inputitemmain inputitemmainwithmenu"
                    v-model="build.temp.current.description"
                    placeholder="请输入地理位置查询"
                  />
                  <button class="inputitemmenu" @click="DescriptionSet" style="background:#4fd7a7;color:#fff;width:45px;border-color:#4fd7a7">
                    <i class="el-icon-search"></i>
                  </button>
                </div>
              </div>
              <div class="mapfixinputin" v-show="build.menu.type=='lnglat'">
                <div class="inputitem">
                  <button class="inputitemtitle">经度</button>
                  <input
                    class="inputitemmain rightnone"
                    v-model="build.temp.current.lng"
                    placeholder="请输入..."
                  />
                </div>
                <div class="inputitem inputitemright">
                  <button class="inputitemtitle leftnone" style>纬度</button>
                  <input
                    class="inputitemmain rightnone"
                    v-model="build.temp.current.lat"
                    placeholder="请输入..."
                  />
                  <button class="inputitemmenu searchmenu btnbordernone" style="background:#4fd7a7;color:#fff;width:45px" @click="LnglatSet">
                    <i class="el-icon-search"></i>
                  </button>
                </div>
                <!-- <div class="inputitem inputitemauto">
                </div>-->
              </div>
            </div>
          </div>
          <div class="mapfixarea menushowarea">
            <div class="mapfixmenu">
              <el-button @click="FuncRoadAct('auto')" v-text="build.menu.iconshow == 'show' ? '隐藏已绘制路线':'显示已绘制路线' "></el-button>
            </div>
          </div>
          <div class="mapview" ref="mapview"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'roadbase',
  props: {
    act: {
      type: String,
      default: 'add'
    },
    itemdata: {
      type: Object,
      default: null,
      required: false
    },
    pageleave: {
      type: Object,
      default: null,
      required: false
    }
  },
  data() {
    return {
      map: new this._mainmod.map(), // 地图实例
      moddata: this._mainmod.moddata,
      depend: this._mainmod.depend,
      mapsearch: null,
      mapinput: null,
      buildroad: new this._mainmod.buildroad('show', {}),
      build: {
        operate: true,
        data: {
          name: '',
          type: '',
          start: '',
          end: '',
          size: 0,
          width: '',
          offset: '',
          remark: ''
        },
        rules: {
          name: [
            { required: true, message: '请输入道路名称', trigger: 'blur' },
            { min: 2, max: 40, message: '长度在 2 到 40 个字符', trigger: 'blur' }
          ],
          type: [
            { required: true, message: '请选择道路类型', trigger: 'change' }
          ],
          start: [
            { required: true, message: '请选择路线起点', trigger: 'change' }
          ],
          end: [
            { required: true, message: '请选择路线终点', trigger: 'change' }
          ],
          size: [
            { validator: (rule, value, callback) => {
              if (value > 0) {
                callback();
              } else {
                callback(new Error('路线长度必须大于0'));
              }
            }, trigger: 'blur', required: true, type: 'number' }
          ],
          width: [
            { validator: (rule, value, callback) => {
              if (value > 0) {
                callback();
              } else {
                callback(new Error('道路宽度必须大于0'));
              }
            }, trigger: 'blur', required: true }
          ],
          offset: [
            { validator: (rule, value, callback) => {
              if (value > 0) {
                callback();
              } else {
                callback(new Error('偏离阈值必须大于0'));
              }
            }, trigger: 'blur', required: true }
          ],
          remark: [
            { required: false, min: 0, max: 100, message: "长度不能超过 100 个字符", trigger: "blur" }
          ]
        },
        menu: {
          type: 'description',
          iconshow: ''
        },
        temp: {
          current: {
            description: '',
            lng: '',
            lat: '',
            program: null
          }
        }
      }
    };
  },
  watch: {
    "depend.load.page.road": function(val) {
      this.ModLoad();
    },
    "buildroad.current.program.data.description": function(val) {
      this.build.temp.current.description = val;
    },
    "buildroad.current.program.data.lng": function(val) {
      this.build.temp.current.lng = val;
    },
    "buildroad.current.program.data.lat": function(val) {
      this.build.temp.current.lat = val;
    },
    "buildroad.current.start.data.description": function(val) {
      this.build.data.start = val;
    },
    "buildroad.current.end.data.description": function(val) {
      this.build.data.end = val;
    },
    "buildroad.size.total": function(val) {
      this.build.data.size = val;
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.BindMapEvent();
      this.map.FuncInit({
        dom: this.$refs["mapview"],
        options: {
          zoom: 13
        },
        event: {
          click: e => {
            this.FuncTemp("click", e);
          }
        }
      }).then(res => {
        this.buildroad.SetMapFunc(this.map);
        this.PageInit();
        this.InitData();
      });
      if (this.pageleave) {
        this.pageleave.callback = () => {
          this.moddata.FuncAct("destroy");
          this.map.FuncAct("destroy");
        };
      }
    });
  },
  methods: {
    InitData() {
      if (this.itemdata) {
        this.build.data.name = this.itemdata.data.detail.name;
        this.build.data.type = this.itemdata.data.detail.type.prop;
        this.build.data.width = this.itemdata.data.detail.width;
        this.build.data.offset = this.itemdata.data.detail.offset;
        this.build.data.remark = this.itemdata.data.detail.remark;
        this.buildroad.SetType(this.build.data.type);
        this.buildroad.ReInitData(this.itemdata.data.detail.startpoint, this.itemdata.data.detail.endpoint, this.itemdata.data.detail.originpath);
        this.map.AutoView();
      }
    },
    PageInit() {
      this.ModLoad();
    },
    BindMapEvent() {
      this.mapinput = this.map.plugin.GetAutoInput({
        input: this.$refs['mapinput']
      });
      this.mapinput.on('select', result => {
        if (result.poi) {
          if (result.poi.location) {
            this.FuncBuildTemp('setlnglat', result.poi.location);
          } else {
            this.SearchLnglat(result.poi.adcode, result.poi.district + result.poi.name).then(res => {
              this.FuncBuildTemp('setlnglat', res.data[0].location);
            }, res => {
              this._func.showmsg('当前选择的选项没有经纬度信息，请手动选择地图或者检索更详细的地址');
            });
          }
        }
      });
    },
    ModLoad(from) {
      if (this.map.load == 'success' && this.depend.load.page.road == 'success') {
        let res = this.moddata.FuncLoad(this.map, [
          {
            name: 'road',
            act: 'base',
            hide: this.build.menu.iconshow == 'show' ? '' : 'hide'
          }
        ]);
        if (res) {
          this._func.hideload();
        }
      }
    },
    SearchLnglat(city, description) {
      return new Promise((resolve, reject) => {
        this.mapsearch = this.map.plugin.GetMapSearch(city);
        this.mapsearch.getLocation(description, (status, result) => {
          if (status == 'complete' && result.geocodes.length > 0) {
            resolve({ status: 'success', data: result.geocodes });
          } else {
            reject({ status: 'fail' });
          }
        });
      });
    },
    FuncTypeChange(type) {
      if (type) {
        this.buildroad.SetType(type);
      }
    },
    ClearInput() {
      this.build.temp.current.description = "";
    },
    DescriptionSet() {
      if (this.build.temp.current.description) {
        this.SearchLnglat('全国', this.build.temp.current.description).then(res => {
          let target = res.data[0];
          if (target && target.location) {
            this.FuncBuildTemp('setlnglat', target.location);
          } else {
            this._func.showmsg('未检索到对应的地址信息，请详细填写后重试', 'warning');
          }
        }, res => {
          // this.ClearInput();
          this._func.showmsg('未检索到对应的地址信息，请详细填写后重试', 'warning');
        });
      }
    },
    LnglatSet() {
      if (this.build.temp.current.lng && this.build.temp.current.lat) {
        this.build.temp.current.lng = Number(this.build.temp.current.lng);
        this.build.temp.current.lat = Number(this.build.temp.current.lat);
        this.FuncBuildTemp('setlnglat', {
          lng: this.build.temp.current.lng,
          lat: this.build.temp.current.lat
        });
      }
    },
    FuncRoadAct(act) {
      if (act == 'auto') {
        if (this.build.menu.iconshow == 'show') {
          this.FuncRoadAct('hide');
        } else {
          this.FuncRoadAct('show');
        }
      } else if (act == 'show') {
        this.moddata.data.road.FuncAct('show');
        this.build.menu.iconshow = 'show';
      } else if (act == 'hide') {
        this.moddata.data.road.FuncAct('hide');
        this.build.menu.iconshow = '';
      }
    },
    FuncTemp(act, data) {
      if (act == 'click') {
        this.FuncSetPoint(data.lnglat);
      }
    },
    FuncSetPoint(data) {
      this.buildroad.FuncPointAct('add', data);
    },
    FuncBuildTemp(act, data) {
      if (act == 'setlnglat') {
        this.buildroad.FuncPointAct('current', data);
        this.map.SetCenter([data.lng, data.lat]);
      }
    },
    PostData(formName) {
      if (this.build.operate) {
        this.build.operate = false;
        this.$refs[formName].validate(valid => {
          if (valid) {
            this._func.showload();
            let postdata = {
              method: this.act,
              customerId: "wz",
              name: this.build.data.name,
              laneType: this.build.data.type,
              laneTypeName: this._mainmod.formatType.GetRoadPropName(this.build.data.type),
              startLat: this.buildroad.current.start.data.lat,
              startLong: this.buildroad.current.start.data.lng,
              startName: this.buildroad.current.start.data.description,
              endLat: this.buildroad.current.end.data.lat,
              endLong: this.buildroad.current.end.data.lng,
              endName: this.buildroad.current.end.data.description,
              gpsFeatures: this.buildroad.GetPath(),
              gpsOffset: this.build.data.offset,
              length: this.build.data.size,
              width: this.build.data.width,
              remark: this.build.data.remark
            };
            if (this.act == 'update') {
              postdata.id = this.itemdata.data.base.id;
            }
            this._func.post("/jobRoad/save", postdata, "token").then(
              res => {
                this._func.hideload();
                if (this.act == 'add') {
                  this.moddata.data.road.FuncPushNew({
                    id: res.data.id,
                    deptName: this.moddata.maindata.organization,
                    roadName: postdata.name,
                    startName: postdata.startName,
                    startLong: postdata.startLong,
                    startLat: postdata.startLat,
                    endName: postdata.endName,
                    endLong: postdata.endLong,
                    endLat: postdata.endLat,
                    roadLength: postdata.length,
                    roadWidth: postdata.width,
                    laneType: postdata.laneType,
                    laneTypeName: postdata.laneTypeName,
                    gpsFeatures: postdata.gpsFeatures,
                    gpsOffset: postdata.gpsOffset,
                    remark: postdata.remark,
                    status: 'unfinished'
                  });
                  this._func.showmsg("作业道路添加成功", "success");
                } else if (this.act == 'update') {
                  this.itemdata.data.detail.name = postdata.name;
                  this.itemdata.data.detail.type.prop = postdata.laneType;
                  this.itemdata.data.detail.type.name = postdata.laneTypeName;
                  this.itemdata.data.detail.startpoint.description = postdata.startName;
                  this.itemdata.data.detail.startpoint.lng = postdata.startLong;
                  this.itemdata.data.detail.startpoint.lat = postdata.startLat;
                  this.itemdata.data.detail.endpoint.description = postdata.endName;
                  this.itemdata.data.detail.endpoint.lng = postdata.endLong;
                  this.itemdata.data.detail.endpoint.lat = postdata.endLat;
                  this.itemdata.data.detail.width = postdata.width;
                  this.itemdata.data.detail.offset = postdata.gpsOffset;
                  this.itemdata.data.detail.size = postdata.length;
                  this.itemdata.data.detail.remark = postdata.remark;
                  this.itemdata.data.detail.originpath = this._mainmod.moddata.data.road.FuncGetPathList(this.itemdata.data.detail.workstatus, postdata.gpsFeatures);
                  this._func.showmsg("作业道路编辑成功", "success");
                  this._func.FuncLink('router', '/task/road/list');
                }
                this.ClearTemp();
                this.build.operate = true;
              },
              res => {
                this._func.hideload();
                this.build.operate = true;
              }
            );
          } else {
            this._func.showmsg("信息填写不完整，请检查", "error");
            this.build.operate = true;
          }
        });
      }
    },
    ResetRoad() {
      this.buildroad.FuncAct('reset');
      this.buildroad = new this._mainmod.buildroad('show', {});
      this.buildroad.SetMapFunc(this.map);
      this.FuncTypeChange(this.build.data.type);
    },
    ClearTemp() {
      let cacherule = this._func.copyjson(this.build.rules);
      this.build.rules = {};
      this.$nextTick(() => {
        this.build.data.name = '';
        this.build.data.type = '';
        this.build.data.start = '';
        this.build.data.end = '';
        this.build.data.size = 0;
        this.build.data.width = '';
        this.build.data.offset = '';
        this.build.data.remark = '';
        this.ResetRoad();
        this.$nextTick(() => {
          this.build.rules = cacherule;
        });
      });
    }
  }
};
</script>
