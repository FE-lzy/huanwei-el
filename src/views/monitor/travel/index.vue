
<template>
  <div class="travel" id="trackDetail">
    <div class="collage-panel">
      <el-collapse value="1" accordion>
        <el-collapse-item name="1">
          <template slot="title">轨迹回放</template>
          <div>
            <el-form label-position="top" label-width="80px">
              <el-select v-model="search.build.carnum" filterable placeholder="请选择车辆">
                <el-option
                  v-for="item in moddata.data.car.list"
                  :key="item.data.base.id"
                  :label="item.data.base.carnum"
                  :value="item.data.base.carnum"
                ></el-option>
              </el-select>
              <el-form-item label="开始时间" style="margin-bottom:0;">
                <el-date-picker
                  v-model="search.build.starttime"
                  type="datetime"
                  placeholder="选择日期时间"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="结束时间" style="margin-bottom:0;">
                <el-date-picker v-model="search.build.endtime" type="datetime" placeholder="选择日期时间"></el-date-picker>
              </el-form-item>
              <el-button class="searchBtn" :plain="true" @click="searchFunc">查询</el-button>
              <div class="rowRadio">
                <div>
                  <el-checkbox
                    v-model="search.menu.detail"
                    :checked="search.menu.detail"
                    @change="FuncDetailAct"
                  >显示轨迹明细</el-checkbox>
                </div>
              </div>
              <el-row>
                <el-col :span="12">
                  <el-checkbox v-model="search.menu.arrestpoint" @change="FuncPointCallback">显示停留点</el-checkbox>
                </el-col>
                <el-col :span="12">
                  <el-select
                    v-model="search.menu.arrestnum"
                    size="small"
                    placeholder="请选择"
                    @change="FuncPointCallback"
                  >
                    <el-option
                      v-for="item in search.data.arrestOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-col>
              </el-row>
              <div class="ratemaindiv">
                <div class="rateindiv">
                  <a-slider
                    class="menuitem menurate"
                    v-model="path.program.navg.data.percent"
                    :min="0"
                    :max="100"
                    :step="0.1"
                    :disabled="path.load!='loaded'"
                    @afterChange="FuncSliderInput"
                    @change="FuncSliderChange"
                  />
                </div>
              </div>
              <div class="search-menu">
                <div>
                  <svg-icon
                    icon-class="play"
                    v-show="path.program.navg.data.current=='stop' "
                    @click="FuncNavg('start')"
                  />
                  <svg-icon
                    icon-class="play"
                    v-show="path.program.navg.data.current=='pause' "
                    @click="FuncNavg('resume')"
                  />
                  <svg-icon
                    icon-class="pause"
                    v-show="path.program.navg.data.current=='move' "
                    @click="FuncNavg('pause')"
                  />
                  <svg-icon icon-class="refresh" @click="restart()" />
                </div>
                <div style="text-align:right">
                  <p>
                    <a
                      :class="search.menu.speed==1 ? 'speedbutton isactived' : 'speedbutton'"
                      @click="FuncSetSpeed(1)"
                    >1X</a>
                    <a
                      :class="search.menu.speed==2 ? 'speedbutton isactived' : 'speedbutton'"
                      @click="FuncSetSpeed(2)"
                    >2X</a>
                    <a
                      :class="search.menu.speed==4 ? 'speedbutton isactived' : 'speedbutton'"
                      @click="FuncSetSpeed(4)"
                    >4X</a>
                  </p>
                </div>
              </div>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <transition name="el-fade-in-linear">
      <div class="trackDetialTable" v-show="search.show.detail">
        <div class="tableTopInfo">
          <el-row>
            <el-col :span="4">运行里程：{{search.detail.data.total.mileage}}</el-col>
            <el-col :span="4">作业里程：{{search.detail.data.total.workmileage}}</el-col>
            <el-col :span="4">运行时间：{{search.detail.data.total.time}}</el-col>
            <el-col :span="4">作业时间：{{search.detail.data.total.worktime}}</el-col>
            <el-col :span="4">总油耗：{{search.detail.data.total.powernum}}</el-col>
            <el-col :span="4" class="closeIcon">
              <div>
                <span @click="HideDetail()">
                  <i class="el-icon-close"></i>
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
        <div style="height:134px;width:100%">
          <el-table
            :data="search.detail.data.list"
            border
            height="134"
            size="mini"
            style="width: 100%;min-width:970px;border: none !important;overflow: auto;"
          >
            <el-table-column prop="#" type="index" label="序号" width="70"></el-table-column>
            <el-table-column prop="carnum" min-width="90" label="车牌号"></el-table-column>
            <el-table-column prop="mileage" min-width="90" label="里程(km)"></el-table-column>
            <el-table-column prop="powernum" min-width="140" label="油量(L)/电量(%)"></el-table-column>
            <el-table-column prop="workstatus" min-width="100" label="作业状态"></el-table-column>
            <el-table-column prop="speed" min-width="100" label="速度(km/h)"></el-table-column>
            <el-table-column prop="collecttime" min-width="150" label="定位时间"></el-table-column>
            <el-table-column prop="address" min-width="220" label="实时位置"></el-table-column>
          </el-table>
        </div>
        <div class="tableTopInfo">
          <div class="block" style="text-align:center">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="search.detail.page.current"
              :page-sizes="[100, 200, 300, 400]"
              :page-size="100"
              layout="total, sizes, prev, pager, next, jumper"
              :total="search.detail.page.total"
            ></el-pagination>
          </div>
        </div>
      </div>
    </transition>
    <div class="mapview" ref="mapview"></div>
  </div>
</template>

<script>
import TravelPath from "@/mod/old/TravelPath";

export default {
  name: "travel",
  data: function() {
    return {
      map: new this._mainmod.map(), // 地图实例
      moddata: this._mainmod.moddata,
      path: TravelPath,
      load: {
        car: ""
      },
      search: {
        build: {
          carnum: "鲁L553U1",
          // 开始时间，显示当前零点
          starttime: new Date(process.env.NODE_ENV == "development" ? 1573315200000 : new Date(new Date().toLocaleDateString()).getTime()),
          // starttime: new Date(1573368059000),
          // 结束时间，显示当前时间
          endtime: new Date(process.env.NODE_ENV == "development" ? 1573747200000 : new Date().getTime())
        },
        menu: {
          detail: false, // 是否显示详情
          arrestpoint: false, // 是否显示停留点
          arrestnum: "0",
          speed: 2,
          progress: true
        },
        detail: {
          page: {
            current: 1,
            pageSize: 100,
            total: 0
          },
          data: {
            list: [],
            total: {}
          }
        },
        show: {
          detail: false
        },
        data: {
          param: null,
          arrestOptions: [
            {
              value: "30",
              label: "30分钟以上"
            },
            {
              value: "60",
              label: "一小时以上"
            },
            {
              value: "1440",
              label: "一天以上"
            },
            {
              value: "0",
              label: "全部"
            }
          ]
        }
      }
    };
  },
  watch: {
    "moddata.data.car.load.base.data": function(val) {
      this.PageInit();
    }
  },
  mounted: function() {
    this._func.showload();
    this.MainmodLoad();
    this.$nextTick(() => {
      this.map
        .FuncInit({
          dom: this.$refs["mapview"],
          options: {
            zoom: 13
          }
        })
        .then(res => {
          this.PageInit();
        });
    });
  },
  methods: {
    HideDetail() {
      this.search.menu.detail = false;
      this.search.show.detail = false;
    },
    MainmodLoad() {
      this._mainmod.depend
        .LoadMod({
          page: "travel",
          modlist: ["formatType", "modcar"]
        })
        .then(res => {}, res => {});
    },
    PageInit() {
      if (
        this.map.load == "success" &&
        this.moddata.data.car.load.base.data == "success"
      ) {
        this.ModLoad("loadcar");
      }
    },
    ModLoad(from) {
      if (
        this.map.load == "success" &&
        this.moddata.data.car.load.base.data == "success"
      ) {
        if (!this.load.car) {
          console.log("load car");
          this.load.car = "success";
          this._func.hideload();
          // 获取所有的数据
          if (this.$route.params.carnum) {
            this.search.build.carnum = this.$route.params.carnum;
            this.GetTravelData();
          }
        }
      }
    },
    HideDetail() {
      this.search.menu.detail = false;
      this.search.show.detail = false;
    },
    // 选中轨迹明细，显示明细的表+轨迹的轨迹点
    FuncDetailAct(val) {
      if (val && this.search.data.param) {
        this.GetDetailAuto();
      } else if (!val) {
        this.HideDetail();
      }
    },
    FuncPointCallback() {
      this.path.SetPathPoint(
        this.search.menu.arrestpoint,
        this.search.menu.arrestnum,
        this.map.program
      );
    },
    FuncPointAct(act) {
      if (act == "auto") {
        this.FuncPointCallback();
      }
    },
    // 查询
    searchFunc() {
      if (this.search.build.carnum == "") {
        this._func.showmsg("请先选择车辆");
        return;
      }
      if (!this.search.build.starttime || !this.search.build.endtime) {
        this._func.showmsg("请选择时间区间");
        return;
      }
      let startTime = this.search.build.starttime.getTime();
      let endTime = Number(this.search.build.endtime);
      let period = (endTime - startTime) / (1000 * 60 * 60 * 24).toFixed(2);
      if (period < 0) {
        this._func.showmsg("结束时间应该大于开始时间");
        return;
      } else if (period > 7) {
        this._func.showmsg("轨迹选择区域请不要超过七天");
        return;
      }
      this.HideDetail();
      this.GetTravelData();
    },
    // 回到起点
    restart() {
      this.FuncNavg("pause");
      this.FuncNavg("start");
    },
    handleSizeChange(val) {
      this.search.detail.pageSize = val;
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.search.detail.current = val;
      console.log(`当前页: ${val}`);
    },
    //设置速度
    FuncSetSpeed(num) {
      this.path.program.navg.FuncSetSpeed(num);
      this.search.menu.speed = num;
    },
    //设置巡航器动作
    FuncNavg(act, restart) {
      this.path.program.navg.FuncAct(act, restart);
    },
    //滑块input事件
    FuncSliderInput(num) {
      console.log("input", num);
      this.path.program.navg.MoveToPercent(num, "get");
      // this.path.program.navg.FuncByLastAction();
    },
    //滑块change事件
    FuncSliderChange(num) {
      console.log("change", num);
      this.path.program.navg.MoveToPercent(num, "set");
    },
    //获取所有数据的函数
    GetTravelData() {
      this._func.showload();
      let param = {
        vehCode: this.search.build.carnum,
        startTime: this.search.build.starttime.getTime().toString(),
        stopTime: this.search.build.endtime.getTime().toString(),
        customerId: "wz"
      };
      this.search.data.param = this._func.copyjson(param);
      let itembasedata = this.moddata.data.car.GetItemByBaseProp(
        "carnum",
        this.search.build.carnum
      );
      if (!itembasedata) {
        this._func.showmsg(
          "当前选择的车辆未在本地检索到对应数据，请刷新后重试！"
        );
        return;
      }
      this._mainmod.formatType.FuncInit().then(res => {
        this.path.InitData(param, itembasedata).then(res => {
          this.FuncBuildPath("alldata");
          this.GetDetailAuto();
          this._func.hideload();
        });
      });
    },
    GetDetailAuto() {
      if (this.search.menu.detail) {
        this.GetDetailFunc(1);
      }
    },
    GetDetailFunc(currentpage) {
      let param = {
        current: this.search.detail.page.current,
        customerId: this.search.data.param.customerId,
        size: this.search.detail.page.pageSize,
        startTime: this.search.data.param.startTime,
        stopTime: this.search.data.param.stopTime,
        vehCode: this.search.data.param.vehCode
      };
      this._func.post("/receiveInfo/selectVehInfo", param, "token").then(
        res => {
          console.log(res);
          if (
            res.data.vehicleItemLists &&
            res.data.vehicleItemLists.length > 0
          ) {
            this.search.detail.data.total.powernum = res.data.fuelTotal;
            this.search.detail.data.total.mileage = res.data.runTotalMiles;
            this.search.detail.data.total.time = res.data.runTotalTime;
            this.search.detail.data.total.workmileage = res.data.workTotalMiles;
            this.search.detail.data.total.worktime = res.data.workTotalTime;
            this.search.detail.data.list = [];
            for (let i = 0; i < res.data.vehicleItemLists.length; i++) {
              let item = res.data.vehicleItemLists[i];
              this.search.detail.data.list.push({
                id: item.id,
                powernum: item.fullOrSoc,
                collecttime: this._func.TimestampToStr(item.recCollectionTime),
                oilnum: item.recFuelQuantity,
                workstatus: this._mainmod.formatType.GetType("car", {
                  target: "workstatus",
                  data: item.recJobStatus
                }).name,
                mileage: item.recTotalMiles,
                speed: item.recVehSpeed,
                vincode: item.recVin,
                address: item.tAddress,
                lat: item.tTranLatitude,
                lng: item.tTranLongitude,
                oiltype: item.vchFuelTypeId,
                carnum: item.vehCode,
                vehid: item.vehId
              });
            }
            this.search.show.detail = true;
            this.search.detail.page.total = res.total;
          } else {
            this._func.showmsg("详情数据为空");
          }
        },
        res => {
        }
      );
    },
    FuncBuildPath(from) {
      let self = this;
      //页面加载完成且地图与数据加载完成后的回调函数
      if (this.map.load == "success" && this.path.data.load == "loaded") {
        this.path.BuildProgram(this.map.program).then(
          function(res) {
            if (res.status == "success") {
              self.FuncSetSpeed(self.search.menu.speed);
              self.FuncPointAct("auto");
            }
          },
          function(res) {}
        );
      }
    },
    //信息框操作
    FuncPopup(act) {
      this.path.FuncPopup(act);
    },
    LikeLeave() {
      this.path.FuncDestroy();
      this.map.FuncDestroy();
    }
  },
  beforeRouteLeave(to, from, next) {
    next();
  }
};
</script>
<style lang='scss' scope>
@import "@/styles/element.scss";
@import "./travel.scss";

.travel,
.mapview {
  width: 100%;
  height: 100%;
}
.collage-panel {
  @include collageSearch();
  .el-collapse-item__content {
    padding-bottom: 0px;
  }
  .el-input__inner {
    background: transparent !important;
    border-radius: 2px !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    color: rgba($color: #fff, $alpha: 0.8);
  }
  .el-collapse-item__wrap {
    @include collageStyle(0.9, 12px);
  }
  .el-collapse-item__header {
    @include collageStyle(0.97, 12px);
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }
  .searchBtn {
    margin: 15px 0;
    width: 100%;
    @include btn($size: 16px, $padding: 0, $radius: 2px);
  }
  // btn悬浮和点击按钮
  .el-button.is-plain:hover,
  .el-button.is-plain:focus {
    background: $themecolor !important;
    color: #fff !important;
  }
  .el-checkbox__inner {
    border-radius: 50% !important;
  }
  .rowRadio {
    margin: 5px 0;
    @include flex();
  }
  .ratemaindiv {
    padding: 0 7px;
    .rateindiv {
      width: 100%;
    }
  }
  .search-menu {
    color: rgba(255, 255, 255, 0.5);
    @include newflex($main: space-between, $cross: center);
    svg,
    a {
      padding-left: 5px;
      cursor: pointer;
      font-size: 20px;
    }
    svg {
      padding: 0;
      margin: 0;
      padding-right: 5px;
      font-size: 28px;
    }
  }
  
}
</style>