<template>
  <div class="carInfo-panel">
    <div class="carInfo-panel-item">
      <div class="carInfo-flex">
        <div>
          <span style="font-weight:bold">车辆详情：</span>
          {{carNum}}
        </div>
        <div>
          <el-radio-group @change="handleTabChange" v-model="tabPosition">
            <el-radio-button label="basic">基本信息</el-radio-button>
            <el-radio-button label="travel">行驶数据</el-radio-button>
            <el-radio-button label="work">作业数据</el-radio-button>
            <el-radio-button label="oil">油耗数据</el-radio-button>
          </el-radio-group>
        </div>
        <div></div>
      </div>
      <div class="carInfo-panel-detail">
        <basic-info ref="basic" v-show="tabPosition == 'basic'"></basic-info>
        <travel-chart ref="travel" v-show="tabPosition == 'travel'"></travel-chart>
        <work-chart ref="work" v-show="tabPosition == 'work'"></work-chart>
        <oil-chart ref="oil" v-show="tabPosition == 'oil'"></oil-chart>
      </div>
    </div>
  </div>
</template>

<script>
import basicInfo from "./model/basicInfo";
import travelChart from "./model/travelChart";
import workChart from "./model/workChart";
import oilChart from "./model/oilChart";

export default {
  name: "carInfo",
  components: {
    basicInfo,
    travelChart,
    workChart,
    oilChart
  },
  data() {
    return {
      tabPosition: "basic",
      vin: "0",
      carNum: this.$route.params.carNum ? this.$route.params.carNum : (localStorage.getItem('carNum') ? localStorage.getItem('carNum') : ''),
      loading: true
    };
  },

  mounted() {
    this.handleVin();
    this.$refs.basic.getData();
  },
  methods: {
    handleTabChange(val) {
      // this.loading = true;
      console.log(this.$refs);
      if (val == "travel") {
        this.$nextTick(() => this.$refs.travel.resize());
      } else if (val == "work") {
        this.$nextTick(() => this.$refs.work.resize());
      } else if (val == "oil") {
        this.$nextTick(() => this.$refs.oil.resize());
      } else {
        this.$nextTick(() => this.$refs.basic.getData());
      }
    },
    // 处理参数
    handleVin() {
      let vinCode = this.$route.params.vin;
      let  carNum = this.$route.params.carNum;
      if (vinCode == undefined) {
        if (!localStorage.getItem("vin")) {
          this.$route.go(-1);
        }
      } else {
        localStorage.removeItem("vin");
        localStorage.removeItem("carNum");
        localStorage.setItem("vin", vinCode);
        localStorage.setItem("carNum", carNum);
      }
    },
    closeLoading() {
      console.log("ceshi");
      this.loading = false;
    }
  }
};
</script>
<style lang="scss">
@import "@/styles/element.scss";
.carInfo-panel {
  display: flex;
  min-height: 100%;
  @include panel(
    $height: auto,
    $bgcolor: #f0f2f5,
    $padding: 70px 20px 20px 20px,
    $margin: 0
  );
  .carInfo-panel-item {
    width: 100%;
    min-height: 100%;
    @include panel($height: auto, $bgcolor: #fff, $padding: 0, $margin: 0);
  }
  .carInfo-flex {
    line-height: 1;
    border-bottom: 1px solid rgba($color: #000, $alpha: 0.1);
    @include panel($height: 90px, $bgcolor: #fff, $padding: 20px, $margin: 0);
    @include newflex($main: space-between, $cross: center);
  }
  .el-radio-button__inner {
    padding: 12px 60px !important;
  }
  .carInfo-panel-detail {
    @include panel(
      $height: calc(100% - 90px),
      $bgcolor: #fff,
      $padding: 20px,
      $margin: 0
    );
  }
}
</style>