<style scoped lang="scss">
@import "@/localstyles/element.scss";
.build {
  @include baseeditarea();
  .piclist {
    width: 100%;
    @include flex($main: space-between, $cross: flex-start);
    .picitemmain{
      width: calc(50% - 5px);
      height: 100%;
      flex: auto;
      flex-basis: 100%;
      &.picitemnext{
        margin-left: 5px;
      }
      .picitem {
        width: 100%;
        height: 75px;
        border-radius: 5px;
        padding: 5px;
        border: 1px dashed;
        border-color: rgba($color: #000000, $alpha: 0.2);
        @include flex($main: center, $cross: center);
        .picicon {
          font-size: 24px;
        }
        .picitempic{
          width: 100%;
          height: 65px;
        }
      }
      .pictitle{
        width: 100%;
        p{
          text-align: center;
          font-size: 12px;
          line-height: 30px;
          height: 30px;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
      }
    }
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
          <el-form-item label="设施类型" prop="type">
            <el-select v-model="build.data.type" placeholder="请选择设施类型" @change="FuncTypeChange">
              <el-option
                v-for="val in _mainmod.formatType.mod.device.dictionary.data"
                :key="val.name"
                :label="val.name"
                :value="val.prop"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设施名称" prop="name">
            <el-input v-model="build.data.name" placeholder="请输入..." />
          </el-form-item>
          <el-form-item label="设施位置" prop="location">
            <el-input v-model="build.data.location" placeholder="请在地图选择" :disabled="true" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="build.data.remark" type="textarea" placeholder="请输入..." />
          </el-form-item>
          <el-form-item label="图片上传" prop="pic">
            <cropper @callback="FuncPic">
              <div>
                <div class="piclist">
                  <div class="picitemmain">
                    <div class="picitem">
                      <i class="el-icon-plus picicon"></i>
                    </div>
                    <div class="pictitle">
                      <p>图片大小&lt;3M</p>
                    </div>
                  </div>
                  <div class="picitemmain picitemnext">
                    <div class="picitem">
                      <img v-if="build.data.pic" class="picitempic" :src="build.temp.pic.url" />
                    </div>
                    <div class="pictitle">
                      <p v-show="build.temp.pic.name" style="color: #1890ff;">{{ build.temp.pic.name }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </cropper>
          </el-form-item>
          <el-form-item class="middlebtn">
            <el-button type="primary" @click="PostData('buildform')">提交</el-button>
            <!-- <el-button @click="ResetData('buildform')">重置</el-button> -->
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="maparea">
      <div class="title">
        <h4>设施定位</h4>
        <div class="subtitle">
          <p v-if="build.temp.current.program" style="color: #4fd7a7" @click="FuncBuildTemp('destroy')">重新绘制</p>
          <p v-else>鼠标左键获取定位点</p>
        </div>
      </div>
      <div class="mainarea">
        <div class="mapin">
          <div class="mapfixarea menutypearea">
            <div class="mapfixmenu">
              <el-radio v-model="build.menu.type" label="position">按地理位置</el-radio>
              <el-radio v-model="build.menu.type" label="lnglat">按经纬度</el-radio>
            </div>
            <div class="mapfixinput">
              <div v-show="build.menu.type=='position'" class="mapfixinputin">
                <div class="inputitem">
                  <input
                    ref="mapinput"
                    class="inputitemmain inputitemmainwithmenu"
                    v-model="build.temp.position"
                    placeholder="请输入地理位置查询"
                  />
                  <button class="inputitemmenu" @click="PositionSet" style="background:#4fd7a7;color:#fff;width:45px;border-color:#4fd7a7">
                    <i class="el-icon-search"></i>
                  </button>
                </div>
              </div>
              <div class="mapfixinputin" v-show="build.menu.type=='lnglat'">
                <div class="inputitem">
                  <button class="inputitemtitle">经度</button>
                  <input
                    class="inputitemmain rightnone"
                    v-model="build.temp.lnglat.lng"
                    placeholder="请输入..."
                  />
                </div>
                <div class="inputitem inputitemright">
                  <button class="inputitemtitle leftnone" style>纬度</button>
                  <input
                    class="inputitemmain rightnone"
                    v-model="build.temp.lnglat.lat"
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
            <div class="mapfixmenu" v-show="build.data.type">
              <el-button @click="FuncDeviceAct('auto')" v-text="build.menu.iconshow == 'show' ? '隐藏已有设施':'显示已有设施' "></el-button>
            </div>
          </div>
          <div class="mapview" ref="mapview"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cropper from "@/components/cropper/index";
export default {
  name: "devicebase",
  components: {
    cropper
  },
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
      build: {
        operate: true,
        data: {
          type: "",
          name: "",
          location: "",
          pic: "",
          remark: ""
        },
        rules: {
          type: [
            { required: true, message: "请选择设施类型", trigger: "change" }
          ],
          name: [
            { required: true, message: "请输入设施名称", trigger: "blur" },
            { min: 2, max: 40, message: "长度在 2 到 40 个字符", trigger: "blur" }
          ],
          location: [
            { required: true, message: "请选择设施位置", trigger: "change" }
          ],
          pic: [
            { required: true, message: "请上传图片", trigger: "change" }
          ],
          remark: [
            { required: false, min: 0, max: 100, message: "长度不能超过 100 个字符", trigger: "blur" }
          ]
        },
        menu: {
          type: "position",
          iconshow: ""
        },
        temp: {
          position: "",
          lnglat: {
            lng: "",
            lat: ""
          },
          pic: {
            id: "",
            url: "",
            filename: ""
          },
          current: {
            program: null
          }
        }
      }
    };
  },
  watch: {
    "depend.load.page.device": function(val) {
      this.ModLoad();
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
        this.InitData();
        this.PageInit();
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
        this.build.data.type = this.itemdata.data.detail.type;
        this.build.data.name = this.itemdata.data.detail.name;
        this.build.data.location = this.itemdata.data.detail.address;
        this.build.data.pic = this.itemdata.data.detail.imgid;
        this.build.data.remark = this.itemdata.data.detail.remark;
        this.build.temp.position = this.itemdata.data.detail.address;
        this.build.temp.lnglat.lng = this.itemdata.data.detail.position[0];
        this.build.temp.lnglat.lat = this.itemdata.data.detail.position[1];
        let srclist = this.itemdata.data.detail.imgsrc.split("/");
        for (let i = srclist.length - 1; i >= 0; i--) {
          if (srclist[i]) {
            this.build.temp.pic.name = srclist[i];
            break;
          }
        }
        this.build.temp.pic.id = this.itemdata.data.detail.imgid;
        this.build.temp.pic.url = this.itemdata.data.detail.imgsrc;
        this.FuncBuildTemp("init");
        if (this.itemdata.data.detail.position[0] && this.itemdata.data.detail.position[1]) {
          this.map.SetCenter(this.itemdata.data.detail.position);
        }
      }
    },
    FuncTypeChange(type) {
      this.ModLoad();
    },
    FuncPic(act, data) {
      let postdata = {
        file: data
      };
      this._func.postform("/picture/upload", postdata, "token").then(
        res => {
          this.build.temp.pic.name = data.name;
          this.build.temp.pic.id = res.data.id;
          this.build.temp.pic.url = res.data.url;
          this.build.data.pic = res.data.id;
        },
        res => {
        }
      );
    },
    SearchLnglat(city, description) {
      return new Promise((resolve, reject) => {
        let mapsearch = this.map.plugin.GetMapSearch(city);
        mapsearch.getLocation(description, (status, result) => {
          if (status == 'complete' && result.geocodes.length > 0) {
            resolve({ status: 'success', data: result.geocodes });
          } else {
            reject({ status: 'fail' });
          }
        });
      });
    },
    PositionSet() {
      if (this.build.temp.position) {
        this.SearchLnglat('全国', this.build.temp.position).then(res => {
          let target = res.data[0];
          if (target && target.location) {
            this.build.temp.lnglat.lng = Number(target.location.lng);
            this.build.temp.lnglat.lat = Number(target.location.lat);
            this.FuncBuildTemp('move');
            this.FuncBuildTemp("post");
            this.map.SetCenter(target.location);
          } else {
            this._func.showmsg('未检索到对应的地址信息，请详细填写后重试', 'warning');
          }
        }, res => {
          // this.ClearInput();
          this._func.showmsg('未检索到对应的地址信息，请详细填写后重试', 'warning');
        });
      }
    },
    ClearInput() {
      this.build.temp.position = "";
    },
    LnglatSet() {
      if (this.build.temp.lnglat.lng && this.build.temp.lnglat.lat) {
        this.build.temp.lnglat.lng = Number(this.build.temp.lnglat.lng);
        this.build.temp.lnglat.lat = Number(this.build.temp.lnglat.lat);
        this.FuncBuildTemp("move");
        this.FuncBuildTemp("post");
        this.map.SetCenter([
          this.build.temp.lnglat.lng,
          this.build.temp.lnglat.lat
        ]);
      }
    },
    BindMapEvent() {
      this.mapsearch = this.map.plugin.GetMapSearch();
      this.mapinput = this.map.plugin.GetAutoInput({
        input: this.$refs["mapinput"]
      });
      this.mapinput.on("select", result => {
        if (result.poi) {
          this.FuncBuildTemp("setlnglat", result.poi.location);
          this.FuncBuildTemp("move");
          this.FuncBuildTemp("post");
          this.map.SetCenter(result.poi.location);
        }
      });
    },
    FuncBuildTemp(act, data, post) {
      if (act == "init") {
        this.build.temp.current.program = this.map.plugin.FuncMod("marker", {
          options: {
            position: [this.build.temp.lnglat.lng, this.build.temp.lnglat.lat],
            draggable: true
          },
          map: this.map.GetProgram()
        });
        this.build.temp.current.program.on("dragend", e => {
          this.FuncTemp("drag", e);
        });
      } else if (act == "destroy") {
        if (this.build.temp.current.program) {
          this.build.temp.current.program.setMap(null);
          this.build.temp.current.program = null;
        }
        this.build.data.location = "";
        this.build.temp.position = "";
        this.build.temp.lnglat.lng = "";
        this.build.temp.lnglat.lat = "";
      } else if (act == "move") {
        if (!this.build.temp.current.program) {
          this.FuncBuildTemp("init");
        }
        this.build.temp.current.program.setPosition([
          this.build.temp.lnglat.lng,
          this.build.temp.lnglat.lat
        ]);
      } else if (act == "setlnglat") {
        this.build.temp.lnglat.lng = data.lng;
        this.build.temp.lnglat.lat = data.lat;
      } else if (act == "post") {
        this.mapsearch.getAddress(
          [this.build.temp.lnglat.lng, this.build.temp.lnglat.lat],
          (status, result) => {
            if (status == "complete" && result.regeocode) {
              this.build.temp.position = result.regeocode.formattedAddress;
              this.build.data.location = result.regeocode.formattedAddress;
            } else {
              this._func.showmsg("地址信息获取失败，请确认后重试", "error");
            }
          }
        );
      }
    },
    FuncTemp(act, data) {
      if (act == "click") {
        this.FuncBuildTemp("setlnglat", {
          lng: data.lnglat.getLng(),
          lat: data.lnglat.getLat()
        });
        this.FuncBuildTemp("move");
        this.FuncBuildTemp("post");
      } else if (act == "drag") {
        this.FuncBuildTemp("setlnglat", {
          lng: data.lnglat.getLng(),
          lat: data.lnglat.getLat()
        });
        this.FuncBuildTemp("post");
      }
    },
    PageInit() {
      this.ModLoad("loaded");
    },
    ModLoad(from) {
      if (this.map.load == "success" && this.depend.load.page.device) {
        if (this.build.data.type) {
          this.moddata.FuncAct("destroy");
          let res = this.moddata.FuncLoad(this.map, [
            {
              name: this.build.data.type,
              act: "base",
              hide: this.build.menu.iconshow == "show" ? "" : "hide"
            }
          ]);
          if (res) {
            this._func.hideload();
          }
        }
      }
    },
    FuncDeviceAct(act) {
      if (act == "auto") {
        if (this.build.data.type && this.moddata.data[this.build.data.type]) {
          if (this.build.menu.iconshow) {
            this.build.menu.iconshow = "";
            this.moddata.data[this.build.data.type].FuncAct("hide");
          } else {
            this.build.menu.iconshow = "show";
            this.moddata.data[this.build.data.type].FuncAct("show");
          }
        } else {
          this._func.showmsg("请选择对于的设施类型后再进行显示操作");
        }
      }
    },
    ClearTemp() {
      let cacherule = this._func.copyjson(this.build.rules);
      this.build.rules = {};
      this.$nextTick(() => {
        this.build.data.name = "";
        this.build.data.pic = "";
        this.build.data.remark = "";
        this.build.temp.pic.id = "";
        this.build.temp.pic.src = "";
        this.build.temp.pic.name = "";
        this.FuncBuildTemp('destroy');
        this.$nextTick(() => {
          this.build.rules = cacherule;
        });
      });
    },
    PostData(formName) {
      if (this.build.operate) {
        this.build.operate = false;
        this.$refs[formName].validate(valid => {
          if (valid) {
            this._func.showload();
            let postdata = {
              method: this.act,
              deptName: this.moddata.maindata.organization,
              address: this.build.data.location,
              customerId: "wz",
              facName: this.build.data.name,
              facType: this.build.data.type,
              facTypeName: this._mainmod.formatType.GetDevice(
                "prop",
                this.build.data.type
              ).name,
              imageId: this.build.data.pic,
              latitude: this.build.temp.lnglat.lat.toString(),
              longitude: this.build.temp.lnglat.lng.toString(),
              remark: this.build.data.remark
            };
            if (this.act == 'update') {
              postdata.id = this.itemdata.data.base.id;
            }
            this._func.post("/facility/save", postdata, "token").then(
              res => {
                this._func.hideload();
                if (this.act == 'add') {
                  let newdata = {
                    id: res.data.id,
                    facName: postdata.facName,
                    facType: postdata.facType,
                    address: postdata.address,
                    facTypeName: postdata.facTypeName,
                    deptName: postdata.deptName,
                    imageName: res.data.imageName,
                    imageUrl: this.build.temp.pic.url,
                    longitude: postdata.longitude,
                    latitude: postdata.latitude,
                    createTime: res.data.createTime,
                    remark: postdata.remark
                  };
                  this.moddata.data[this.build.data.type].FuncPushNew(newdata);
                  this._func.showmsg("设施添加成功", "success");
                } else if (this.act == 'update') {
                  this.itemdata.data.detail.type = postdata.facType;
                  this.itemdata.data.detail.typename = postdata.facTypeName;
                  this.itemdata.data.detail.name = postdata.facName;
                  this.itemdata.data.detail.address = postdata.address;
                  this.itemdata.data.detail.position[0] = postdata.longitude;
                  this.itemdata.data.detail.position[1] = postdata.latitude;
                  this.itemdata.data.detail.imgname = res.data.latitude;
                  this.itemdata.data.detail.imgsrc = this.build.temp.pic.url;
                  this.itemdata.data.detail.remark = postdata.remark;
                  this._func.showmsg("设施编辑成功", "success");
                  this._func.FuncLink('router', '/info/device/list');
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
    ResetData(formName) {
      // this.$refs[formName].resetFields();
      this.ClearTemp();
    }
  }
};
</script>