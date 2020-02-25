<template>
  <div class="location">
    <div class="location-panel">
      <div class="collapse-header" @click="data.menushow = !data.menushow">
        <span class="collapse-title">定位监控</span>
        <i class="el-icon-arrow-down" :class="data.menushow ? 'bottom' : 'right'"></i>
      </div>
      <div class="searchInput">
        <el-autocomplete
          class="inline-input"
          v-model="data.search.carnum"
          placeholder="请输入内容"
          :trigger-on-focus="false"
          @select="FuncSelect"
          :fetch-suggestions="FuncSearch"
        >
          <p
            class="search-icon-clear"
            slot="suffix"
            v-show="data.search.carnum"
            @click="FuncSearchAct('clear')"
          >
            <i class="el-icon-close"></i>
          </p>
          <template slot-scope="props">
            <div class="resultlist">
              <div class="resultcarnum">
                <svg-icon icon-class="car" />
                {{ props.item.data.base.carnum }}
              </div>
              <div class="resultcarstatus">
                <span
                  :style="{color: props.item.data.base.workstatus.color}"
                >{{ props.item.data.base.workstatus.name }}</span>/
                <span
                  :style="{color: props.item.data.base.carstatus.color}"
                >{{ props.item.data.base.carstatus.name }}</span>
              </div>
            </div>
          </template>

          <el-button slot="append" icon="el-icon-search" @click="FuncSearchAct('search')"></el-button>
        </el-autocomplete>
      </div>
      <div class="tableBox">
        <el-collapse-transition>
          <div v-show="data.menushow">
            <div class="tabStyle">
              <el-tabs v-show="!data.search.show" v-model="data.pane.current" size="mini">
                <el-tab-pane label="全部" name="1">
                  <car-list
                    :toptitle="`${moddata.maindata.organization}(${moddata.data.car.list.length})`"
                    :mainlist="moddata.data.car.list"
                    @click="FuncCarAct"
                  ></car-list>
                </el-tab-pane>
                <el-tab-pane label="在线" name="2">
                  <car-list
                    :toptitle="`${moddata.maindata.organization}(${moddata.data.car.data.onlinelist.length})`"
                    :mainlist="moddata.data.car.data.onlinelist"
                    @click="FuncCarAct"
                  ></car-list>
                </el-tab-pane>
                <el-tab-pane label="离线" name="3">
                  <car-list
                    :toptitle="`${moddata.maindata.organization}(${moddata.data.car.data.offlinelist.length})`"
                    :mainlist="moddata.data.car.data.offlinelist"
                    @click="FuncCarAct"
                  ></car-list>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="data.search.show" v-model="data.search.currentname" size="mini">
                <el-tab-pane label="检索结果" name="1">
                  <car-list :mainlist="data.search.showlist" @click="FuncCarAct"></car-list>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>
    <div class="location-panel-iconSign">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="图层控制" name="1">
          <p>设施类型</p>
          <div class="panellist">
            <v-button type="primary" :class="menu.control.current == 'total' ? 'panelitem choice' : 'panelitem'" size="small" @click="SetCurrentType('total')">全部</v-button>
            <v-button type="primary" :class="menu.control.current == 'road' ? 'panelitem choice' : 'panelitem'" size="small" @click="SetCurrentType('road')">作业道路</v-button>
            <v-button type="primary" :class="menu.control.current == val.prop ? 'panelitem choice' : 'panelitem'" size="small" @click="SetCurrentType(val.prop)" v-for="(val,k) in _mainmod.formatType.mod.device.dictionary.data" :key="k">{{ val.name }}</v-button>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="location-panel-icon">
      <div class="icon-list" v-if="menu.control.current == 'total' || menu.control.current == 'trash'">
        <div class="icon-list-title">收运作业图例</div>
        <div class="icon-list-content">
          <div v-for="(i,k) in menu.icons.trash" :key="k">
            <img :src="i.img" />
            <span>{{ i.title }}</span>
          </div>
        </div>
      </div>
      <div class="icon-list" v-if="menu.control.current == 'total' || menu.control.current == 'road'">
        <div class="icon-list-title">车辆作业图例</div>
        <div class="icon-list-content">
          <div v-for="(i,k) in moddata.data.road.data.type" :key="k">
            <div class="icon-road-color" :style="{background:i.color}"></div>
            <span>{{ i.title }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="mapview" ref="mapview"></div>
  </div>
</template>

<script>
import carList from "./carList";
export default {
  name: "location",
  components: {
    carList
  },
  data: function() {
    return {
      activeNames: [],
      menu: {
        control: {
          current: 'total'
        },
        icons: {
          trash: [
            {
              img: this._mainmod.formatType.GetDeviceIcon("trash", "unfinished"),
              title: "已收运"
            },
            {
              img: this._mainmod.formatType.GetDeviceIcon("trash", "finished"),
              title: "未收运"
            }
          ]
        }
      },
      depend: this._mainmod.depend,
      moddata: this._mainmod.moddata,
      map: new this._mainmod.map(), // 地图实例
      loading: null,
      data: {
        search: {
          show: false,
          carnum: "",
          popershow: false,
          cachelist: [],
          showlist: [],
          currentname: "1"
        },
        menushow: true,
        pane: {
          current: "1"
        }
      }
    };
  },
  watch: {
    "depend.load.page.location": function(val) {
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
          },
          plugin: {
            toolbar: {
              options: {
                offset: this.map.plugin.FuncMod("pixel", {
                  options: [0, 60]
                }),
                position: "RT"
              }
            },
            scalebar: {
              options: {
                offset: this.map.plugin.FuncMod("pixel", {
                  options: [0, 10]
                }),
                position: "RB"
              }
            }
          }
        })
        .then(res => {
          this.PageInit();
        });
    });
  },
  methods: {
    SetCurrentType(type) {
      this.menu.control.current = type;
      this.moddata.FuncAct('show', {
        list: ['car', type]
      });
    },
    MainmodLoad() {
      this._mainmod.depend
        .LoadMod({
          page: "location",
          modlist: ["formatType", "modcar", "modroad", "moddevice"]
        })
        .then(res => {}, res => {});
    },
    ModLoad() {},
    PageInit() {
      if (
        this.map.load == "success" &&
        this.depend.load.page.location == "success"
      ) {
        let res = this.moddata.FuncLoad(this.map);
        // let res = this.moddata.FuncLoad(this.map);
        if (res) {
          this.map.AutoView();
          this._func.hideload();
        }
      }
    },
    FuncSearch(queryString, cb) {
      let restaurants = this.moddata.data.car.GetList();
      let results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据回建议列表的数
      this.data.search.cachelist = results;
      cb(results);
    },
    FuncSearchAct(act) {
      if (act == "clear") {
        this.data.search.carnum = "";
        this.data.search.cachelist.splice(0, this.data.search.cachelist.length);
      } else if (act == "search") {
        if (!this.data.search.carnum) {
          this.data.search.show = false;
        } else if (this.data.search.cachelist.length > 0) {
          this.data.search.showlist = this.data.search.cachelist.splice(
            0,
            this.data.search.cachelist.length
          );
          this.data.search.show = true;
        } else {
          this._func.Message({
            message: "未检索到车辆，请更改检索条件后重试",
            duration: 2000,
            offset: 120
          });
          this.data.search.show = false;
        }
      }
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.data.base.carnum
            .toLowerCase()
            .indexOf(queryString.toLowerCase()) > -1
        );
      };
    },
    FuncSelect(item) {
      this.data.search.carnum = item.data.base.carnum;
      this.data.search.cachelist = [];
      this.data.search.cachelist.push(item);
      this.FuncSearchAct("search");
      this.FuncCarAct("click", item);
    },
    FuncCarAct(act, itemdata) {
      this.moddata.data.car.FuncBaseEventByAct(act, itemdata);
    }
  },
  beforeRouteLeave(to, from, next) {
    this.moddata.FuncAct("destroy");
    this.map.FuncAct("destroy");
    next();
  }
};
</script>
<style lang='scss' scope >
@import "./location.scss";
@import "@/localstyles/element.scss";
.location,
.mapview {
  width: 100%;
  height: 100%;
}
$bgColor: hsl(236, 18%, 18%);
.el-autocomplete-suggestion__wrap {
  background: $bgColor;
  border-color: $bgColor;
  li {
    padding: 0 0;
    color: rgba($color: #fff, $alpha: 0.7);
  }
  li:hover {
    background: rgba($color: #4fd7a7, $alpha: 0.4);
  }
  .resultlist {
    @include flex($main: space-around);
    padding: 0 10px;
    .resultcarnum {
      min-width: 75px;
      font-size: 12px;
    }
    .resultcarstatus {
      font-size: 12px;
    }
  }
}
.popper__arrow {
  display: none !important;
}
.el-autocomplete-suggestion {
  border: none !important;
}
.el-popper[x-placement^="bottom"] {
  margin-top: 0 !important;
  opacity: 0.95 !important;
}
</style>