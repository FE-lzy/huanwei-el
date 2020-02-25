<template>
  <div class="app-container">
    <div class="search-panel">
      <el-form :inline="true" :model="formInline" ref="formInline" class="demo-form-inline">
        <el-form-item label="车牌号" prop="vehCode">
          <el-input v-model="formInline.vehCode"></el-input>
        </el-form-item>
        <el-form-item label="VIN码" prop="vehVinCode">
          <el-input v-model="formInline.vehVinCode"></el-input>
        </el-form-item>

        <el-form-item class="btn">
          <el-button type="default" @click="getData">查询</el-button>
        </el-form-item>
        <el-form-item class="btn">
          <a @click="resetForm()">重置</a>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-panel">
      <div class="table">
        <el-table :data="tableData" stripe :height="tableHeight"  style="width: 100%;text-align:center">
          <el-table-column prop="序号" label="序号" width="80" type="index"></el-table-column>
          <el-table-column prop="vehCode" label="车牌号" width="180"></el-table-column>
          <el-table-column prop="vehUseSortName" label="用途分类" width="180"></el-table-column>
          <el-table-column prop="vehUseTypeName" label="用途类型"></el-table-column>
          <el-table-column prop="vehVinCode" label="VIN码"></el-table-column>
          <el-table-column prop="vchFuelTypeName" label="燃油类型"></el-table-column>
        </el-table>
      </div>
      <div style="text-align:center;margin-top:30px;">
        <div class="block">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-size="pageSize"
            :page-sizes="[15, 20, 30,50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _func from "@/func/main";
const x = 280;
export default {
  data() {
    return {
      tableHeight: document.documentElement.clientHeight - x,
      formInline: {
        vehCode: "",
        vehVinCode: ""
      },
      tableData: [],
      total: 0, //总数
      currentPage: 1,
      pageSize: 15
    };
  },
  mounted() {
    this.getData();
    
  },
  methods: {
    getData() {
      let queryParam = {
        vehCode: this.formInline.vehCode,
        vehVinCode: this.formInline.vehVinCode,
        size: this.pageSize,
        current: this.currentPage,
        orderBy: "",
        orderDirection: ""
      };
      _func.post("/vehicle/list", queryParam, 'token').then(res => {
        // console.log(res);
        let data = res.data;
        this.total = data.total;
        this.tableData = data.records;
      });
    },
    resetForm() {
      (this.formInline.vehVinCode = ""), (this.formInline.vehCode = "");
      this.getData();
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
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/element.scss";
.search-panel {
  @include panel(#f4f4f5, 15px, 0,$height:70px);
  .btn {
    float: right;
  }
}
.el-form-item {
  margin-bottom: 0 !important;
}
</style>

