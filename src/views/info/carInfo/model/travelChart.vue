<template>
  <div>
    <div class="travel-flex">
      <div>
        <span>行驶数据统计</span>
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
    <div ref="charts" id="chartPid" :class="className" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import _func from "@/func/main";
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";
const animationDuration = 6000;
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
    }
  },
  data() {
    return {
      chart: null,
      dateStrings: [new Date() - 24 * 60 * 60 * 30 * 1000, new Date()]
    };
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
    resize() {
      this.initChart();
      this.chart.resize();
    },
    initChart() {
      console.log('123');
      this.chart = echarts.init(this.$refs.charts, "macarons");
      let queryParam = {
        startTime: new Date(this.dateStrings[0]).getTime(),
        stopTime: new Date(this.dateStrings[1]).getTime(),
        vehVin: localStorage.getItem("vin")
      };
      console.log(queryParam);
      _func.post("/vehicleinfo/selectrectotalmiles", queryParam, "token").then(
        res => {
          if (res.status == "success") {
            if (res.message == "20191223") {
              Message.warning("暂无数据");
            }
            console.log(res);
            let xData = [];
            let yData = [];
            res.data.map(item => {
              xData.push(item.recCollectionTime);
              yData.push(item.recTotalMiles);
            });

            this.$emit("closeLoading");
            this.chart.setOption({
              tooltip: {
                trigger: "axis",
                axisPointer: {
                  // 坐标轴指示器，坐标轴触发有效
                  type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
                }
              },
              grid: {
                top: 30,
                left: "2%",
                right: "3%",
                bottom: "3%",
                containLabel: true
              },
              xAxis: [
                {
                  type: "category",
                  nameTextStyle: {
                    color: "#333"
                  },
                  axisLine: {
                    lineStyle: {
                      color: "#333"
                    }
                  },
                  name: "日期",
                  data: xData,
                  axisTick: {
                    alignWithLabel: true
                  }
                }
              ],
              yAxis: [
                {
                  type: "value",
                  name: "里程(km)",
                  nameLocation: "end",
                  nameTextStyle: {
                    color: "#333"
                  },
                  axisLine: {
                    lineStyle: {
                      color: "#333"
                    }
                  },
                  axisTick: {
                    show: false
                  }
                }
              ],
              series: [
                {
                  name: "里程",
                  type: "bar",
                  stack: "vistors",
                  barWidth: "60%",
                  itemStyle: {
                    normal: {
                      color: "#1890FF"
                    }
                  },
                  data: yData,
                  animationDuration
                }
              ]
            });
            this.chart.hideLoading();
          } else {
            this.$message.error(res.messge);
          }
        },
        res => {
          console.log(res);
        }
      );
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
.chart {
  height: 100%;
  width: 100%;
}
</style>
