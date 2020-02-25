<template>
  <div class="category-add-panel">
    <div class="category-add-panel-item">
      <div class="category-add-flex">
        <div>信息录入</div>
      </div>
      <div class="category-add-content">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item
            label="作业名称"
            prop="planName"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-input v-model="form.planName" placeholder="请填写..."></el-input>
          </el-form-item>
          <el-form-item
            label="作业类型"
            prop="jobTypeName"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-select
              v-model="form.jobTypeName"
              @change="changeJobTypeName('type')"
              placeholder="请选择作业类型"
              value-key="value"
            >
              <el-option
                v-for="(item,k) in option.jobTypeOption"
                :label="item.label"
                :value="item.value"
                :key="k"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :label="form.jobTypeName == 'transfer' ? '转运道路' :  '作业道路'"
            prop="roadIds"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-select
              v-model="form.roadIds"
              multiple
              filterable
              @change="changeJobTypeName"
              :disabled="form.jobTypeName ? false : true"
              placeholder="请选择作业线路"
              value-key="id"
            >
              <el-option
                v-for="(item,k) in option.routeOptions"
                :label="item.roadName"
                :value="item.id"
                :key="k"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="作业班次"
            prop="shiftIds"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-select
              v-model="form.shiftIds"
              @change="changeJobTypeName"
              multiple
              filterable
              :disabled="form.jobTypeName ? false : true"
              placeholder="请选择作业班次"
              value-key="id"
            >
              <el-option
                v-for="(item,k) in option.shiftIdsOptions"
                :label="item.shiftName"
                :value="item.id"
                :key="k"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="作业车辆"
            prop="vehicleIds"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-select
              v-model="form.vehicleIds"
              @change="changeVehicle"
              :multiple="form.jobTypeName == 'whole' ? true : false"
              :multiple-limit="(form.jobTypeName == 'whole' && selectVehicleType.indexOf('sweeper')>-1) ? 1 : 2"
              filterable
              :disabled="(form.jobTypeName!=='' && form.roadIds.length>0 && form.shiftIds.length>0) ? false : true"
              placeholder="请选择作业车辆"
              value-key="vinCode"
            >
              <el-option
                v-for="(item,k) in option.vehiclesOptions"
                :disabled="!item.canChoice"
                :label="item.vehCode"
                :key="k"
                :value="item.vinCode"
              >
                <span style="float: left">{{ item.vehCode }}</span>
                <span
                  style="float: right; color: #8492a6; font-size: 13px"
                >{{ handleType(item.useTypeCode) }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="作业频次"
            prop="jobFrequencyCode"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-select v-model="form.jobFrequencyCode" placeholder="请选择作业频次">
              <el-option label="一次/天" value="once"></el-option>
              <el-option label="两次/天" value="twice"></el-option>
              <el-option label="三次/天" value="three"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" placeholder="请填写..."></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="category-block">
        <v-button @click="$router.go(-1)">取消</v-button>
        <v-button type="primary" @click="submit('form')">提交</v-button>
      </div>
    </div>
  </div>
</template>

<script>
import _func from "@/func/main";
import { Message } from "element-ui";
export default {
  name: "add",
  data() {
    return {
      form: {
        planName: "",
        jobTypeName: "",
        roadIds: [],
        vehicleIds: [],
        shiftIds: [],
        jobFrequencyCode: "",
        remark: "",
        vehicles: [],
        roads: []
      },
      option: {
        shiftIdsOptions: [],
        routeOptions: [],
        vehiclesOptions: [],
        jobTypeOption: [
          { label: "全作业", value: "whole" },
          { label: "清扫作业", value: "clean" },
          { label: "洒水作业", value: "water" },
          { label: "转运作业", value: "transfer" }
        ]
      },
      selectVehicleType: []
    };
  },
  mounted() {
    if (this.$route.query && this.$route.query.params) {
      _func
        .post("/jobPlan/info", { id: this.$route.query.params.id }, "token")
        .then(res => {
          console.log(res);
          let data = res.data;
          this.form = data;
          this.form.jobTypeName = data.jobTypeCode;

          this.form.roadIds = data.roads.map(item => {
            return item.id;
          });
          this.form.shiftIds = data.shifts;
          this.form.vehicleIds =
            data.jobTypeCode == "whole"
              ? data.vehicles.map(item => {
                  return item.vinCode;
                })
              : data.vehicles[0].vinCode;
          console.log(this.form.vehicleIds);
          this.changeVehicle(this.form.vehicleIds);
          this.changeJobTypeName();
        });
    }
  },
  methods: {
    changeVehicle(idList) {
      // console.log(idList);
      this.$forceUpdate();
      if (typeof idList == "string") {
        return;
      }
      this.selectVehicleType = [];
      idList.map(item => {
        if (item) {
          this.selectVehicleType.push(this.getVehicleType(item));
        }
      });
      for (let i = 0; i < this.option.vehiclesOptions.length; i++) {
        if (idList.indexOf(this.option.vehiclesOptions[i].vinCode) > -1) {
          this.option.vehiclesOptions[i].canChoice = true;
        } else {
          if (
            this.selectVehicleType.indexOf(
              this.option.vehiclesOptions[i].useTypeCode
            ) > -1
          ) {
            this.option.vehiclesOptions[i].canChoice = false;
          } else {
            if (this.selectVehicleType.indexOf("sweeper") > -1) {
              this.option.vehiclesOptions[i].canChoice = false;
            } else if (
              this.selectVehicleType.indexOf("water") > -1 &&
              this.selectVehicleType.indexOf("clean") > -1
            ) {
              this.option.vehiclesOptions[i].canChoice = false;
            } else {
              this.option.vehiclesOptions[i].canChoice = true;
              if (
                this.option.vehiclesOptions[i].useTypeCode == "sweeper" &&
                this.selectVehicleType.length > 0
              ) {
                this.option.vehiclesOptions[i].canChoice = false;
              }
            }
          }
        }
      }
    },
    handleType(type) {
      if (type == "water") {
        return "洒";
      } else if (type == "rubbish") {
        return "垃";
      } else if (type == "clean") {
        return "清";
      } else {
        return "洗扫";
      }
    },
    handleData(id, data) {
      console.log("data ", data);
      let arr = [];
      if (id == 1) {
        for (let i = 0; i < data.length; i++) {
          arr.push({ vehVinCode: data[i] });
        }
      } else {
        for (let i = 0; i < data.length; i++) {
          arr.push({ id: data[i] });
        }
      }
      console.log(JSON.stringify(arr));
      return arr;
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let queryParam = {
            id: this.form.id,
            method: this.form.id ? "update" : "add",
            jobFrequencyName: this.switchJobReq(),
            jobFrequencyCode: this.form.jobFrequencyCode,
            jobTypeCode: this.form.jobTypeName,
            jobTypeName: this.switchName(),
            planName: this.form.planName,
            remark: this.form.remark,
            roadIds: this.handleData(0, this.form.roadIds),
            shiftIds: this.handleData(0, this.form.shiftIds),
            vehVinCodes:
              typeof this.form.vehicleIds == "string"
                ? [{ vehVinCode: this.form.vehicleIds }]
                : this.handleData(1, this.form.vehicleIds)
          };
          let _this = this;
          _func.post("/jobPlan/save", queryParam, "token").then(res => {
            console.log(res);
            if (res.status == "success") {
              Message.success("提交成功");
              setTimeout(function() {
                _this.$router.go(-1);
              }, 500);
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    changeJobTypeName(val) {
      console.log("shiftIds ", this.form.shiftIds);
      if (val == "type") {
        this.form.roadIds = [];
        this.form.shiftIds = [];
        this.form.vehicleIds = this.form.jobTypeName == "whole" ? [] : "";
      }

      this.getShifts();
      this.getRoutes();
      this.getVihicles();
      console.log("shiftIdsOptions", this.option);
    },
    getShifts() {
      _func
        .post(
          "/jobPlan/shifts",
          { jobTypeCode: this.form.jobTypeName },
          "token"
        )
        .then(res => {
          this.option.shiftIdsOptions = res.data;
        });
    },
    getVehicleType(vehicleVal) {
      if (
        this.option.vehiclesOptions &&
        this.option.vehiclesOptions.length > 0
      ) {
        for (let j = 0; j < this.option.vehiclesOptions.length; j++) {
          if (this.option.vehiclesOptions[j].vinCode == vehicleVal) {
            return this.option.vehiclesOptions[j].useTypeCode;
          }
        }
      }
    },
    getVihicles(vehicleVal = null) {
      let isAbled =
        this.form.jobTypeName !== "" &&
        this.form.roadIds.length > 0 &&
        (typeof this.form.shiftIds === "string"
          ? this.form.shiftIds !== 0
          : this.form.shiftIds.length > 0);
      console.log("是否查询车辆", isAbled);
      if (isAbled) {
        let param = {
          jobType: this.form.jobTypeName,
          roadIds: this.form.roadIds,
          shiftIds: this.form.shiftIds
        };
        _func.post("/jobPlan/vehicles", param, "token").then(res => {
          this.option.vehiclesOptions = res.data;

          for (let i = 0; i < this.form.vehicles.length; i++) {
            if (this.isPushArr(this.form.vehicles[i].useTypeCode)) {
              this.option.vehiclesOptions.push(this.form.vehicles[i]);
            }
          }
          this.option.vehiclesOptions.map(item => {
            return (item.canChoice = true);
          });
        });
      }
    },
    isPushArr(type) {
      let typename = this.form.jobTypeName;
      if (typename == "whole") {
        return ["clean", "water", "sweeper"].indexOf(type) > -1 ? true : false;
      } else if (typename == "clean" || typename == "water") {
        return type == typename;
      } else if (typename == "transfer") {
        return typename == "rubbish";
      }
    },
    getRoutes() {
      _func
        .post(
          "/jobPlan/routes",
          { jobTypeCode: this.form.jobTypeName },
          "token"
        )
        .then(res => {
          this.option.routeOptions = res.data;
          this.option.routeOptions = this.option.routeOptions.concat(
            this.form.roads
          );
          console.log(res);
        });
    },
    switchJobReq(id) {
      switch (this.form.jobFrequencyCode) {
        case "once":
          return "一次/天";
        case "twice":
          return "两次/天";
        case "three":
          return "三次/天";
      }
    },
    switchName() {
      switch (this.form.jobTypeName) {
        case "alltypes":
          return "全部类型";
        case "whole":
          return "全作业";
        case "clean":
          return "清扫作业";
        case "water":
          return "洒水作业";
        case "transfer":
          return "转运作业";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/element.scss";
.category-add-panel {
  display: flex;
  min-height: 100%;
  @include panel(
    $height: auto,
    $bgcolor: #f0f2f5,
    $padding: 70px 20px 20px 20px,
    $margin: 0
  );
  .category-add-panel-item {
    width: 100%;
    min-height: 100%;
    @include panel($height: auto, $bgcolor: #fff, $padding: 0, $margin: 0);
  }
  .category-add-flex {
    line-height: 1;
    width: 100%;
    border-bottom: 1px solid #ccc;
    @include panel($height: 50px, $bgcolor: #fff, $padding: 20px, $margin: 0);
    @include newflex($main: space-between, $cross: center);
  }
  .category-add-content {
    margin: 50px 0;
    @include newflex($main: center, $cross: center);
  }
  .category-block {
    margin-right: 10px;
    & > div :first-child {
      margin-right: 5px;
    }
    @include newflex($main: flex-end, $cross: center);
  }
  //   .el-input__inner{
  //       width: 420px !important;
  //   }
  .el-form-item {
    width: 500px !important;
  }
}
</style>