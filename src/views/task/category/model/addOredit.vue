<template>
  <div class="category-add-panel">
    <div class="category-add-panel-item">
      <div class="category-add-flex">
        <div>信息录入</div>
      </div>
      <div class="category-add-content">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item
            label="班次名称"
            prop="shiftName"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-input v-model="form.shiftName" placeholder="请填写..."></el-input>
          </el-form-item>
          <el-form-item
            label="作业类型"
            prop="jobTypeId"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-select v-model="form.jobTypeId" placeholder="请选择类型">
              <el-option label="全作业" value="whole"></el-option>
              <el-option label="清扫作业" value="clean"></el-option>
              <el-option label="洒水作业" value="water"></el-option>
              <el-option label="转运作业" value="transfer"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="作业时段"
            prop="date"
            :rules="[{
            required:true,message: '请输入', trigger: 'blur'
          }]"
          >
            <el-time-picker
              is-range
              v-model="form.date"
              value-format="HH:mm:ss"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
            ></el-time-picker>
          </el-form-item>
          <el-form-item
            label="迟到阀值"
            prop="lateThreshold"
            :rules="[
              { required: true, message: '请输入'},
              { type: 'number', message: '必须为数字值'}
            ]"
          >
            <el-input placeholder="请填写..." v-model.number="form.lateThreshold">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="早退阀值"
            prop="earlyThreshold"
            :rules="[
              { required: true, message: '请输入'},
              { type: 'number', message: '必须为数字值'}
            ]"
          >
            <el-input placeholder="请填写..." v-model.number="form.earlyThreshold">
              <template slot="append">分钟</template>
            </el-input>
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
import { Message } from 'element-ui';
export default {
  name: "add",
  data() {
    return {
      form: {
        shiftName: "",
        jobTypeId: "",
        date: ['',''],
        lateThreshold: "",
        earlyThreshold: "",
        remark: ""
      }
    };
  },
  mounted() {
    if (this.$route.query && this.$route.query.params) {
      this.form = this.$route.query.params;
      this.form.date = [
        this.$route.query.params.startWorkTime,
        this.$route.query.params.offWorkTime
      ];
      this.form.lateThreshold = parseInt(
        this.$route.query.params.lateThreshold
      );
      this.form.earlyThreshold = parseInt(
        this.$route.query.params.earlyThreshold
      );
    }
  },
  methods: {
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let queryParam = {
            ...this.form,
            startWorkTime: this.form.date[0],
            offWorkTime: this.form.date[1],
            jobTypeName: this.switchName(this.form.jobTypeId)
          };
          delete queryParam.date;

          let _this = this;
          let url = this.form.id ? "/baJobShift/update" : "/baJobShift/add";
          _func.post(url, queryParam, "token").then(res => {
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
    switchName(id) {
      switch (id) {
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
}
</style>