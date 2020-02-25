<style scoped lang="scss">
@import "@/localstyles/element.scss";
.build {
  @include baseeditarea();
  .listdiv{
    width: 100%;
    max-width: 200px;;
    min-height: 38px;
    max-height: 154px;
    overflow: auto;
    border: 1px solid #DCDFE6; border-radius: 5px;
    .listdivitem{
      max-width: 200px;
      line-height: 38px;
      height: 38px;;
      padding: 0 15px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      &.likeplaceholder{
        color: #ccc;
      }
      .listdivitemlast{
        float: right;
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
          <el-form-item label="路线名称" prop="name">
            <el-input v-model="build.data.name" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="垃圾桶数" prop="num">
            <div class="listdiv">
              <p v-if="build.data.list.length <= 0" class="listdivitem likeplaceholder">
                <span>0</span>
                <span class="listdivitemlast">个</span>
              </p>
              <p v-else class="listdivitem">
                <span>{{ build.data.num }}</span>
                <span class="listdivitemlast">个</span>
              </p>
            </div>
          </el-form-item>
          <el-form-item label="垃圾桶" prop="list">
            <div class="listdiv">
              <template v-if="build.data.list.length <= 0">
                <p class="listdivitem likeplaceholder">点击地图获取</p>
              </template>
              <template v-else>
                <p class="listdivitem" v-for="val in build.data.list" :key="val.data.base.id">{{ val.data.detail.name }}</p>
              </template>
            </div>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="build.data.remark" type="textarea" placeholder="请输入..." />
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
        <h4>路线绘制</h4>
        <div class="subtitle">
          <p v-if="build.data.list.length > 0" style="color: #4fd7a7" @click="ResetListData()">重新绘制</p>
          <p v-else>依次点选图中垃圾桶</p>
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
            <div class="mapfixmenu">
              <el-button @click="FuncDeviceAct('auto')" v-text="build.menu.iconshow == 'show' ? '隐藏已分配垃圾桶':'显示已分配垃圾桶' "></el-button>
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
  name: "cleanroutebuild",
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
          name: "",
          num: 0,
          list: [],
          remark: ""
        },
        rules: {
          name: [
            { required: true, message: "请输入路线名称", trigger: "blur" },
            { min: 2, max: 40, message: "长度在 2 到 40 个字符", trigger: "blur" }
          ],
          num: [
            {
              validator: (rule, value, callback) => {
                if (value > 0) {
                  callback();
                } else {
                  callback(new Error("垃圾桶数量必须大于0"));
                }
              },
              trigger: "blur",
              required: true
            }
          ],
          list: [
            {
              validator: (rule, value, callback) => {
                if (value.length > 0) {
                  callback();
                } else {
                  callback(new Error("垃圾桶数量必须大于0"));
                }
              },
              trigger: "blur",
              required: true
            }
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
            url: ""
          }
        }
      }
    };
  },
  watch: {
    "depend.load.page.cleanroute": function(val) {
      this.ModLoad("watch");
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
        this.PageInit();
      });
      if (this.pageleave) {
        this.pageleave.callback = () => {
          this.moddata.data.trash.FuncCurrent("destroy");
          this.moddata.FuncAct("destroy");
          this.map.FuncAct("destroy");
        };
      }
    });
  },
  methods: {
    InitData() {
      return new Promise((resolve, reject) => {
        if (this.itemdata) {
          this.build.data.name = this.itemdata.name;
          this.build.data.remark = this.itemdata.remark;
          this.GetData().then(res => {
            resolve(res);
          }, res => {
            reject(res);
          });
        } else {
          resolve({ status: 'success' })
        }
      });
    },
    GetData() {
      return new Promise((resolve, reject) => {
        this._func.showload();
        this._func.get('/transferRoute/getUpdateById/' + this.itemdata.id, {}, 'token').then(res => {
          let trashlist = res.data.trashId ? res.data.trashId.split(',') : [];
          this.moddata.data.trash.FuncCurrent('edit', trashlist);
          this._func.hideload();
          resolve(res);
        }, res => {
          this._func.hideload();
          this.BackToList();
          reject(res);
        });
      });
    },
    ClearInput() {
      this.build.temp.position = "";
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
    LnglatSet() {
      if (this.build.temp.lnglat.lng && this.build.temp.lnglat.lat) {
        this.build.temp.lnglat.lng = Number(this.build.temp.lnglat.lng);
        this.build.temp.lnglat.lat = Number(this.build.temp.lnglat.lat);
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
        if (result.poi && result.poi.location) {
          this.map.SetCenter(result.poi.location);
        }
      });
    },
    FuncTemp(act, data) {
      if (act == "click") {
        // this.map.SetCenter(data.lnglat);
      }
    },
    PageInit() {
      this.ModLoad("loaded");
    },
    ModLoad(from) {
      if (this.map.load == "success" && this.depend.load.page.cleanroute == "success") {
        this.moddata.data.trash.GetDistribution().then(res => {
          let readystatus = this.moddata.FuncLoad(this.map,
            [
              {
                name: "trash",
                act: "distribution",
                hide: ""
              }
            ]
          );
          // console.log(readystatus);
          if (readystatus) {
            this.InitData().then(res => {
              this.moddata.data.trash.FuncCurrent("build", {
                callback: (act, itemdata) => {
                  if (act == "add") {
                    this.build.data.list.push(itemdata);
                    this.build.data.num = this.build.data.list.length;
                  } else if (act == "del") {
                    for (let i = 0; i < this.build.data.list.length; i++) {
                      if (this.build.data.list[i] == itemdata) {
                        this.build.data.list.splice(i, 1);
                      }
                    }
                    this.build.data.num = this.build.data.list.length;
                  }
                }
              });
              this.map.AutoView();
            }, res => {});
          }
        }, res => {});
      }
    },
    FuncDeviceAct(act) {
      if (act == "auto") {
        if (this.build.menu.iconshow) {
          this.build.menu.iconshow = "";
          this.moddata.data.trash.FuncCurrent("hide");
        } else {
          this.build.menu.iconshow = "show";
          this.moddata.data.trash.FuncCurrent("show");
        }
      }
    },
    ResetListData() {
      this.moddata.data.trash.FuncCurrent("reset", {
        list: this.build.data.list
      });
      this.build.data.list = [];
    },
    ClearTemp() {
      let cacherule = this._func.copyjson(this.build.rules);
      this.build.rules = {};
      this.$nextTick(() => {
        this.build.data.name = "";
        this.build.data.num = 0;
        this.build.data.list = [];
        this.build.data.remark = "";
        this.$nextTick(() => {
          this.build.rules = cacherule;
        });
      });
    },
    GetListId() {
      let list = [];
      for (let i = 0; i < this.build.data.list.length; i++) {
        list.push(this.build.data.list[i].data.base.id);
      }
      return list;
    },
    BackToList() {
      this._func.FuncLink('router', '/task/cleanroute/list');
    },
    PostData(formName) {
      if (this.build.operate) {
        this.build.operate = false;
        this.$refs[formName].validate(valid => {
          if (valid) {
            this._func.showload();
            let postdata = {
              customerId: "wz",
              customerName: this.moddata.maindata.organization,
              routeName: this.build.data.name,
              trashNum: this.build.data.list.length,
              trashId: this.GetListId().join(","),
              remark: this.build.data.remark
            };
            let url = '/transferRoute/add';
            if (this.act == 'update') {
              postdata.id = this.itemdata.id;
              url = '/transferRoute/update';
            }
            this._func.post(url, postdata, "token").then(
              res => {
                this.moddata.data.trash.FuncCurrent("change", {
                  list: this.build.data.list,
                  show: this.build.menu.iconshow
                });
                this._func.hideload();
                this._func.showmsg("转运路线添加成功", "success");
                this.ClearTemp();
                this.build.operate = true;
                if (this.act == 'update') {
                  this.BackToList();
                }
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
      this.$refs[formName].resetFields();
    }
  }
};
</script>