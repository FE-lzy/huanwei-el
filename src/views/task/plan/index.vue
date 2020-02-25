
<template>
  <div class="plan-panel">
    <div class="plan-panel-item">
      <div class="plan-menu-flex">
        <div class="plan-menu-button">
          <v-button type="primary" icon="el-icon-plus" @click="$router.push('/task/plan/planadd')">新增</v-button>
          <v-button ref="selectBtn" @click="deleteRows" :disabled="selectBtn" tooltip="请先选择">批量删除</v-button>
        </div>
        <div>
          <div class="menu-right">
            <div>作业类型：</div>
            <el-select @change="getData()" v-model="form.fileSearch" placeholder="请选择">
              <el-option
                v-for="(item,k) in form.jobTypeOption"
                :label="item.label"
                :value="item.value"
                :key="k"
              ></el-option>
            </el-select>
          </div>
          <div class="menu-right">
            <div>计划名称：</div>
            <el-input @keyup.enter.native="getData()" placeholder="请输入..." suffix-icon="el-icon-search" v-model="form.planName"></el-input>
          </div>
        </div>
      </div>
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        :height="tableHeight"
        style="width: 100%;padding:5px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="80"></el-table-column>
        <el-table-column prop="planName" label="计划名称"></el-table-column>
        <el-table-column prop="roadNames" label="作业道路" :formatter="roadFormat"></el-table-column>
        <el-table-column prop="vehicles" label="作业车辆" :formatter="vehiclesFormat"></el-table-column>
        <el-table-column prop="jobPeriods" label="作业时间段" :formatter="jobPeriodsFormat"></el-table-column>
        <el-table-column prop="jobFrequency" label="作业班次"></el-table-column>
        <el-table-column prop="jobType" label="作业类型"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="text" @click="deleteRows(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="block">
        <div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[15, 20, 30,50, 100]"
            layout="total, prev, pager, next, sizes,jumper"
            :total="tabletotal"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const x = 280;
import _func from "@/func/main";
import { Message } from "element-ui";
export default {
  name: "travel",
  data: function() {
    return {
      tableHeight: document.documentElement.clientHeight - x,
      form: {
        fileSearch: "",
        planName: "",
        jobTypeOption: [
          { label: "全部类型", value: "" },
          { label: "全作业", value: "whole" },
          { label: "清扫作业", value: "clean" },
          { label: "洒水作业", value: "water" },
          { label: "转运作业", value: "transfer" }
        ]
      },
      pageSize: 15,
      currentPage: 1,
      tabletotal: 1,
      selectBtn: true,
      tableData: [],
      multipleSelection: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    roadFormat(row, column) {
      return row.jobTypeCode == 'transfer' ?  row.routeNames.join(',') : row.roadNames.join(",");
    },
    vehiclesFormat(row, column) {
      let vehArr = row.vehCodes;
      let newArr = [];
       for(let i=0;i<vehArr.length;i++){
         newArr.push(vehArr[i].vehCode + this.handleType(vehArr[i].useTypeCode)) 
       }
      return newArr.join(",");
    },
    jobPeriodsFormat(row, column) {
      return row.jobPeriods.join(",");
    },
    handleType(type) {
      if (type == "water") {
        return "(洒)";
      } else if (type == "rubbish") {
        return "(垃)";
      } else if (type == "clean") {
        return "(清)";
      } else {
        return "(洗扫)";
      }
    },
    getData() {
      let queryParam = {
        jobType: this.form.fileSearch,
        planName: this.form.planName,
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
      };
      _func.post("/jobPlan/list", queryParam, "token").then(res => {
        console.log(res);
        this.tableData = res.data.records;
        delete this.tableData.roadNames;
        this.tableData.roadNames = res.data.records.jobType == 'jobTypeCode' ? res.data.records.routeNames : res.data.records.roadNames
        this.tabletotal = res.data.total;
        // this.currentPage = res.current;
        console.log(this.tableData);
      });
    },
    handleSelectionChange(val) {
      console.log(val);
      if (val.length > 0) {
        this.selectBtn = false;
      } else {
        this.selectBtn = true;
      }
      this.multipleSelection = val.map(item=>{
        return item.id
      });
    },
    deleteRows(index, row) {
      console.log(index,row,this.multipleSelection); 
      let param = {
        ids: row ? [row.id] : this.multipleSelection
      };
      let _this = this;
       _func.MessageBox.confirm("是否继续?", "确定删除该条记录?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          _func.post("/jobPlan/delete", param, "token").then(res => {
            Message.success('删除成功');
            _this.getData();
          });
        })
        .catch(() => {});
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getData();
      console.log(`当前页: ${val}`);
    },
    handleEdit(index,row) {
      this.$router.push({ path: "/task/plan/planadd", query: { params: row } });
    },
    handleDelete() {}
  }
};
</script>
<style lang='scss' scope>
@import "@/styles/element.scss";
.plan-panel {
  display: flex;
  min-height: 100%;
  @include panel(
    $height: auto,
    $bgcolor: #f0f2f5,
    $padding: 60px 20px 20px 20px,
    $margin: 0
  );
  .plan-panel-item {
    width: 100%;
    min-height: 100%;
    @include panel($height: auto, $bgcolor: #fff, $padding: 0, $margin: 0);
  }
  .plan-menu-flex {
    line-height: 1;
    width: 100%;
    @include panel($height: 50px, $bgcolor: #f0f2f5, $padding: 0, $margin: 0);
    @include newflex($main: space-between, $cross: center);
  }
  .menu-right {
    display: -webkit-inline-box;
    &:first-child {
      margin-right: 10px;
    }
    & > div {
      line-height: 44px;
    }
  }
  .plan-menu-button > div {
    display: inline-block;
    &:first-child {
      margin-right: 10px;
    }
  }
  .el-input--suffix .el-input__inner :first-child {
    background: #f0f2f5;
  }
  .block {
    position: absolute;
    bottom: 40px;
    right: 40px;
  }
  .el-table thead {
    color: #3f3f3f;
  }
  .el-button--text {
    color: #f9a6a6;
    &:first-child {
      color: #64acff;
    }
  }
}
</style>