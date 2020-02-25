<template>
  <div>
    <div>
      <!-- 基本信息 -->
      <table class="basic-table" width="100%" align="left">
        <tr class="title">
          <td colspan="4">基本信息</td>
        </tr>
        <tr class="detail">
          <td>车牌号</td>
          <td>{{basicData.vehCode}}</td>
          <td>VIN码</td>
          <td>{{basicData.vehVinCode}}</td>
        </tr>
        <tr class="detail">
          <td>品牌</td>
          <td>{{basicData.vehBrandName}}</td>
          <td>车系</td>
          <td>{{basicData.vehAudi}}</td>
        </tr>
        <tr class="detail">
          <td>用途分类</td>
          <td>{{basicData.vehUseSortName}}</td>
          <td>用途类型</td>
          <td>{{basicData.vehUseTypeName}}</td>
        </tr>
        <tr>
          <td>车型</td>
          <td colspan="3">{{basicData.vehMotorcycleType}}</td>
        </tr>
      </table>
      <!-- 发动机 -->
      <table class="basic-table" width="100%" align="left">
        <tr class="title">
          <td colspan="4">发动机</td>
        </tr>
        <tr class="detail">
          <td>发动机品牌</td>
          <td>{{basicData.vehGradeBrand}}</td>
          <td>发动机号</td>
          <td>{{basicData.vehGrade}}</td>
        </tr>
        <tr class="detail">
          <td>排放标注</td>
          <td>{{basicData.vchPip}}</td>
          <td>燃料标准</td>
          <td>{{basicData.vchFuelTypeName}}</td>
        </tr>
      </table>
      <!-- 底盘参数 -->
      <table class="basic-table" width="100%" align="left">
        <tr class="title">
          <td colspan="4">底盘参数</td>
        </tr>
        <tr class="detail">
          <td>底盘品牌</td>
          <td>{{basicData.vehChassisCodeBrand}}</td>
          <td>底盘车型</td>
          <td>{{basicData.chassisModel}}</td>
        </tr>
        <tr class="detail">
          <td>底盘型号</td>
          <td>{{basicData.vehChassisCode}}</td>
          <td></td>
          <td></td>
        </tr>
      </table>
      <!-- 服务日期 -->
      <table class="basic-table" width="100%" align="left">
        <tr class="title">
          <td colspan="4">服务日期</td>
        </tr>
        <tr class="detail">
          <td>开始日期</td>
          <td>{{basicData.serviceStartTime | FormatBaseTimeData　}}</td>
          <td>结束日期</td>
          <td>{{basicData.serviceEndTime | FormatBaseTimeData　}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import _func from "@/func/main";
export default {
  name: "basicInfo",
  data() {
    return {
      basicData: {
        vehCode: "",
        vehVinCode: "",
        vehBrandName: "",
        vehAudi: "",
        vehUseSortName: "",
        vehUseTypeName: "",
        vehMotorcycleType: "",
        vehGrade: "",
        vchPip: "",
        vchFuelTypeName: ""
      }
    };
  },
  watch: {
    // vin(val, newVal) {
    //   this.getData();
    // }
  },
  methods: {
    getData() {
      let queryParam = { vehVin: localStorage.getItem("vin") };
      console.log("请求参数：", queryParam);

      _func.post("/vehicleinfo/list", queryParam, "token").then(
        res => {
          console.log(res);
          if (res.status == "success") {
            this.basicData = res.data;
          } else {
            this.$message.error(res.messge);
          }
          this.$emit("closeLoading");
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
table {
  margin-bottom: 25px;
}
.basic-table {
  border-collapse: collapse;
  border: none;
}
td {
  padding: 15px;
  border: solid #ccc 1px;
}
.title {
  background: #f7f7f7;
  td {
    font-size: 16px;
    font-weight: bold;
  }
}
.detail {
  td:nth-child(2n-1) {
    width: 13%;
  }
  td:nth-child(2n) {
    width: 37%;
  }
}
</style>