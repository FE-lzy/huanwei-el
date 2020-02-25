
<template>
  <div class="plan-panel">
    <div class="plan-panel-item">
      <div class="plan-menu-flex">
        <div class="plan-menu-button">
          <v-button
            type="primary"
            icon="el-icon-plus"
            @click="$router.push('/info/device/build')"
          >新增</v-button>
          <v-button ref="selectBtn" @click="deleteRows" :disabled="selectBtn" tooltip="请先选择">批量删除</v-button>
        </div>
        <div>
          <div class="menu-right">
            <div>设施类型：</div>
            <el-select v-model="data.type" placeholder="请选择设施类型" @change="FuncTypeChange">
              <!-- <el-option :label="'全部'" :value="'total'" /> -->
              <el-option
                v-for="val in _mainmod.formatType.mod.device.dictionary.data"
                :key="val.name"
                :label="val.name"
                :value="val.prop"
              />
            </el-select>
          </div>
          <div class="menu-right" @change="ModLoad('search')">
            <div>设施名称：</div>
            <el-input placeholder="请输入..." v-model="data.name">
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
        <el-table-column prop="data.detail.name" label="设施名称" min-width="80"></el-table-column>
        <el-table-column prop="data.detail.typename" label="设施类型" min-width="80"></el-table-column>
        <el-table-column prop="data.detail.orgname" label="所属单位" min-width="100"></el-table-column>
        <el-table-column label="设施照片" min-width="120">
          <template slot-scope="scope" class="itemimg" >
            <a
              :href="scope.row.data.detail.imgsrc"
              target="_blank"
              style="color:#409EFF"
            >点击查看图片</a>
          </template>
        </el-table-column>
        <el-table-column prop="data.detail.address" label="位置信息" min-width="120"></el-table-column>
        <el-table-column prop="data.detail.remark" label="备注" min-width="100"></el-table-column>
        <el-table-column prop="data.detail.createtime" label="时间" min-width="100"></el-table-column>
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
            :total="data.mainlist.length"
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
  name: "devicelist",
  data: function() {
    return {
      tableHeight: document.documentElement.clientHeight - x,
      moddata: this._mainmod.moddata,
      depend: this._mainmod.depend,
      device: this._mainmod.device,
      data: {
        type: "trash",
        name: "",
        mainlist: [],
        list: [],
        page: {
          current: 1,
          size: 15
        }
      },
      selectBtn: true,
      multipleSelection: []
    };
  },
  watch: {
    "depend.load.page.device": function(val) {
      this.ModLoad("watch");
    }
  },
  mounted() {
    this.ModLoad("mounted");
  },
  methods: {
    FuncEdit(itemdata) {
      console.log(itemdata);
      this._func.FuncLink("router", {
        name: "编辑设施",
        params: {
          itemdata: itemdata
        }
      });
    },
    FuncTypeChange(type) {
      this.ModLoad("typechange");
    },
    ModLoad(from) {
      if (this.depend.load.page.device == "success") {
        let mainlist = this.device.GetMainList(this.data.type, this.moddata);
        if (this.data.name) {
          this.data.mainlist = [];
          for (let i = 0; i < mainlist.length; i++) {
            let itemdata = mainlist[i];
            if (itemdata.data.detail.name.indexOf(this.data.name) > -1) {
              this.data.mainlist.push(itemdata);
            }
          }
        } else {
          this.data.mainlist = mainlist;
        }
        this.getlist();
      }
    },
    getlist() {
      this.data.list = [];
      let start = (this.data.page.current - 1) * this.data.page.size;
      let end = start + this.data.page.size;
      this.data.list = this.data.mainlist.slice(start, end);
      if (this.data.mainlist.length > 0 && this.data.list.length <= 0 && this.data.page.current != 1) {
        this.PageChange(this._func.getnum(this.data.mainlist.length / this.data.page.size, 'ceil', 0));
      }
    },
    SizeChange(current) {
      this.data.page.size = current;
      this.getlist();
    },
    PageChange(current) {
      this.data.page.current = current;
      this.getlist();
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
      let deleteArr = [];
      let mainlist = [];
      if (row) {
        mainlist.push(row);
        deleteArr.push(row.data.base.id);
      } else {
        deleteArr = this.multipleSelection.map(item => {
          mainlist.push(item);
          return item.data.base.id;
        });
      }
      if (mainlist.length > 0) {
        this._func.MessageBox.confirm('是否继续?', '确定删除该条记录?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this._func.post("/facility/delete", { ids: deleteArr }, "token").then(res => {
            if (res.status == "success") {
              this._func.showmsg("删除成功", 'success');
            }
            this.device.DelItem(mainlist, this.moddata);
            this.ModLoad("del");
          }, res => {});
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