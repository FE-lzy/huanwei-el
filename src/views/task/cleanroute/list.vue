
<template>
  <div class="plan-panel">
    <div class="plan-panel-item">
      <div class="plan-menu-flex">
        <div class="plan-menu-button">
          <v-button
            type="primary"
            icon="el-icon-plus"
            @click="$router.push('/task/cleanroute/build')"
          >新增</v-button>
          <v-button ref="selectBtn" @click="deleteRows" :disabled="selectBtn" tooltip="请先选择">批量删除</v-button>
        </div>
        <div>
          <div class="menu-right">
            <div>路线名称：</div>
            <el-input placeholder="请输入..." v-model="data.search.name" @change="FuncSearch">
              <i slot="suffix" class="el-icon-search"></i>
            </el-input>
          </div>
        </div>
      </div>
      <el-table
        ref="multipleTable"
        :data="data.list"
        tooltip-effect="dark"
        :height="tableHeight"
        style="width: 100%;padding:5px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="路线名称" min-width="80"></el-table-column>
        <el-table-column prop="orgname" label="所属单位" min-width="100"></el-table-column>
        <el-table-column prop="num" label="垃圾桶数量" min-width="120"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="100"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="FuncEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="text" @click="deleteRows(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <div>
          <el-pagination
            :total="data.page.total"
            :page-sizes="[15, 20, 30, 50, 100]"
            :page-size="data.page.size"
            :current-page.sync="data.page.current"
            layout="total, prev, pager, next, sizes,jumper"
            @size-change="SizeChange"
            @current-change="PageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const x = 280;
export default {
  name: "cleanroutelist",
  data: function() {
    return {
      tableHeight: document.documentElement.clientHeight - x,
      depend: this._mainmod.depend,
      data: {
        type: "total",
        mainlist: [],
        search: {
          name: '',
          tempname: ''
        },
        list: [],
        page: {
          current: 1,
          size: 15,
          total: 0
        }
      },
      selectBtn: true,
      multipleSelection: []
    };
  },
  mounted() {
    this.ModLoad("mounted");
  },
  methods: {
    FuncEdit(itemdata) {
      this._func.FuncLink("router", {
        name: "编辑转运路线",
        params: {
          itemdata: itemdata
        }
      });
    },
    FuncSearch() {
      this.ModLoad('search');
    },
    ModLoad(from) {
      this.GetData().then(res => {}, res => {});
    },
    GetData() {
      return new Promise((resolve, reject) => {
        let postdata = {
          current: this.data.page.current,
          size: this.data.page.size
        };
        if (this.data.search.name) {
          postdata.routeName = this.data.search.name;
        }
        this._func.post("/transferRoute/fetchList", postdata, "token").then(
          res => {
            this.ResetData(res.data);
            resolve({
              status: "success"
            });
          },
          res => {
            reject(res);
          }
        );
      });
    },
    ResetData(resdata) {
      this.data.page.total = resdata.total;
      this.data.list = [];
      for (let i = 0; i < resdata.records.length; i++) {
        this.data.list.push({
          id: resdata.records[i].id,
          name: resdata.records[i].routeName,
          orgname: resdata.records[i].customerName,
          num: resdata.records[i].trashNum,
          remark: resdata.records[i].remark
        });
      }
      if (this.data.list.length <= 0 && this.data.page.current != 1) {
        this.PageChange(this._func.getnum(this.data.mainlist.length / this.data.page.size, 'ceil', 0));
      }
    },
    SizeChange(current) {
      this.data.page.size = current;
      this.ModLoad();
    },
    PageChange(current) {
      this.data.page.current = current;
      this.ModLoad();
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selectBtn = false;
      } else {
        this.selectBtn = true;
      }
      this.multipleSelection = val;
    },
    deleteRows(index, row) {
      let idlist = [];
      if (row) {
        idlist.push(row.id);
      } else {
        idlist = this.multipleSelection.map(item => {
          return item.id;
        });
      }
      if (idlist.length > 0) {
        this._func.MessageBox.confirm('是否继续?', '确定删除该条记录?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this._func.post("/transferRoute/delete", { ids: idlist }, "token").then(res => {
            if (res.status == "success") {
              this._func.showmsg('删除成功', 'success');
            }
            this.ModLoad();
          });
        }).catch(() => {
        });
      }
    }
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