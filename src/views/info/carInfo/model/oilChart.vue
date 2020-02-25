<template>
  <div>
    <div class="travel-flex">
      <div>
        <span>油耗数据统计</span>
      </div>
      <div>
        <el-date-picker
          v-model="dateStrings"
          :clearable="false"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="onChange"
        ></el-date-picker>
        <br />
      </div>
    </div>
    <div ref="charts" :class="className" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";
import _func from "@/func/main";
import { Message } from "element-ui";
export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: `${document.documentElement.clientHeight}` - 350 + "px"
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object
    }
  },
  data() {
    return {
      chart: null,
      dateStrings: [new Date() - 24 * 60 * 60 * 30 * 1000, new Date()]
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        console.log(val);
        this.setOptions(val);
      }
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    onChange(dates) {
      console.log(dates[1], dates[0]);
      if (dates[1] - dates[0] > 60 * 60 * 24 * 30 * 1000) {
        Message.warning("选择时长请不要超过30天");
        this.dateStrings = [new Date() - 24 * 60 * 60 * 30 * 1000, new Date()];
        return;
      }
      if (dates[1] < dates[0]) {
        Message.warning("结束时间应该大于开始时间");
        this.dateStrings = [new Date() - 24 * 60 * 60 * 30 * 1000, new Date()];
        return;
      }
      this.initChart();
    },
    initChart() {
      this.chart = echarts.init(this.$refs.charts, "macarons");

      let queryParam = {
        startTime: new Date(this.dateStrings[0]).getTime(),
        stopTime:
          new Date(this.dateStrings[0]).getTime() ==
          new Date(this.dateStrings[1]).getTime()
            ? new Date(this.dateStrings[0]).getTime() + 1000 * 60 * 60 * 24
            : new Date(this.dateStrings[1]).getTime(),
        vehVin: localStorage.getItem("vin")
      };

      let _this = this;
      _func
        .post("/vehicleinfo/selectrecfuelquantity", queryParam, "token")
        .then(
          res => {
            if (res.status == "success") {
              console.log(res);
              if (res.data.length == 0) {
                Message.warning("暂无数据");
              }
              let xData = [];
              let yData = [];
              res.data.map(item => {
                xData.push(item.recCollectionTime);
                yData.push(item.recFuelQuantity);
              });

              this.setOptions(this.chartData, xData, yData);
              this.chart.hideLoading();
            } else {
              this.$message.error(res.messge);
            }
          },
          res => {
            console.log(res);
          }
        );
    },
    setOptions({ expectedData, actualData } = {}, x, y) {
      this.chart.setOption({
        xAxis: {
          // data: [12-1,12-2,12-3,12-4,12-5,12-6,12-7,12-8,12-9,12-10,12-11,12-12,12-13,12-14,12-15],
          data: x,
          boundaryGap: false,
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#333"
            }
          },
          name: "日期"
        },
        grid: {
          left: "2%",
          right: "3%",
          bottom: "3%",
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#333"
            }
          }
        },
        series: [
          {
            name: "expected",
            itemStyle: {
              normal: {
                color: "#FF005A",
                lineStyle: {
                  color: "#FF005A",
                  width: 2
                }
              }
            },
            smooth: true,
            type: "line",
            data: expectedData,
            animationDuration: 2800,
            animationEasing: "cubicInOut"
          },
          {
            name: "油量",
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                color: "#1890FF",
                lineStyle: {
                  color: "#1890FF",
                  width: 2
                },
                areaStyle: {
                  color: "#1890FF"
                }
              }
            },
            // data: [20,14,1,4,1,4,5,8,8,8,8,97,7,9,5],
            data: y,
            animationDuration: 2800,
            animationEasing: "quadraticOut"
          }
        ]
      });
    },

    resize() {
      this.initChart();
      this.chart.resize();
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/styles/element.scss";
.travel-flex {
  line-height: 1;
  font-size: 18px;
  @include panel($height: 65px, $bgcolor: #fff, $padding: 0, $margin: 0);
  @include newflex($main: space-between, $cross: center);
}
.chart-panel {
  height: calc(100%-300px) !important;
}
</style>

