
<template>
  <div class="cate-panel">
    <div class="cate-panel-item">
      <div class="cate-menu-flex">
        <div class="cate-menu-button">
          <v-button type="primary" icon="el-icon-plus" @click="$router.push('/task/category/categoryadd')">新增</v-button>
          <v-button ref="selectBtn" @click="deleteRows()" :disabled="selectBtn" tooltip="请先选择">批量删除</v-button>
        </div>
        <div style="display:-webkit-inline-box;">
          <div style="line-height:44px;">作业类型：</div>
          <el-select v-model="jobTypeId" clearable @change="getData" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div ref="multipleTable">
        <el-table
          :data="tableData"
          tooltip-effect="dark"
          :height="tableHeight"
          style="width: 100%;padding:5px;"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="80"></el-table-column>
          <el-table-column prop="shiftName" label="班次名称"></el-table-column>
          <el-table-column prop="jobTypeName" label="作业类型"></el-table-column>
          <el-table-column label="作业时间段" :formatter="jobTimeFormat"></el-table-column>
          <el-table-column prop="lateThreshold" label="迟到阀值(分钟)"></el-table-column>
          <el-table-column prop="earlyThreshold" label="早退阀值(分钟)"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>

          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="mini" type="text" @click="deleteRows(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="block">
        <div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-size="pageSize"
            :page-sizes="[15, 20, 30,50, 100]"
            layout="total, prev, pager, next, sizes,jumper"
            :total="total"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _func from "@/func/main";
import { Message } from "element-ui";
import { mapGetters } from "vuex";

export default {
  name: "travel",
  computed: {
    ...mapGetters(["screenful"])
  },
  data: function() {
    return {
      tableHeight: document.documentElement.clientHeight - 280,
      jobTypeId: "",
      pageSize: 15,
      currentPage: 0,
      selectBtn: true,
      x: this.screenful ? 240 : 280,
      total: 0,
      options: [
        {
          value: "",
          label: "全部类型"
        },
        {
          value: "whole",
          label: "全作业"
        },
        {
          value: "clean",
          label: "清扫作业"
        },
        {
          value: "water",
          label: "洒水作业"
        },
        {
          value: "transfer",
          label: "转运作业"
        }
      ],
      tableData: [],
      multipleSelection: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      let queryParam = {
        current: this.currentPage,
        deFlag: true,
        jobTypeId: this.jobTypeId,
        orderBy: "",
        orderDirection: "",
        size: this.pageSize
      };
      _func.post("/baJobShift/list", queryParam, "token").then(res => {
        console.log(res);
        this.tableData = res.data.records;
        this.total = res.data.total;

        // this.total = data.total;
        // this.tableData = data.records;
      });
    },
    jobTimeFormat(row, value) {
      // console.log(row, value);
      return row.startWorkTime + "-" + row.offWorkTime;
    },
    handleSelectionChange(val) {
      console.log(val);
      if (val.length > 0) {
        this.selectBtn = false;
      } else {
        this.selectBtn = true;
      }
      this.multipleSelection = val;
    },
    deleteRows(index, row) {
      let deleteArr = [];
      if (row) {
        deleteArr.push(row.id);
      } else {
        deleteArr = this.multipleSelection.map(item => {
          return item.id;
        });
      }
      let _this = this;
      _func.MessageBox.confirm("是否继续?", "确定删除该条记录?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          _func
            .post("/baJobShift/delete/" + deleteArr, {}, "token")
            .then(res => {
              if (res.status == "success") {
                Message.success("删除成功");
              }

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
    handleEdit(index, row) {
      this.$router.push({ path: "/task/category/categoryadd", query: { params: row } });
      console.log(index, row);
    }
  }
};
</script>
<style lang='scss' scope>
@import "@/styles/element.scss";
.cate-panel {
  display: flex;
  min-height: 100%;
  @include panel(
    $height: auto,
    $bgcolor: #f0f2f5,
    $padding: 60px 20px 20px 20px,
    $margin: 0
  );
  .cate-panel-item {
    width: 100%;
    min-height: 100%;
    @include panel($height: auto, $bgcolor: #fff, $padding: 0, $margin: 0);
  }
  .cate-menu-flex {
    line-height: 1;
    width: 100%;
    @include panel($height: 50px, $bgcolor: #f0f2f5, $padding: 0, $margin: 0);
    @include newflex($main: space-between, $cross: center);
  }
  .cate-menu-button > div {
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