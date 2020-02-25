<template>
  <div class="mainlist">
    <div class="title" v-show="toptitle">
      <div class="icon">
        <svg-icon icon-class="file" />
      </div>
      <p>{{toptitle}}</p>
    </div>
    <div class="list">
      <el-scrollbar style="height:100%">
        <div :class="val.data.base.current ? 'item itemchoice':'item'" v-for="(val,k) in list" :key="k" @click="FuncClick(val)" >
          <div class="itemicon">
            <div class="icon">
              <svg-icon icon-class="car" style="font-size:18px;"  />
            </div>
            <p>{{val.data.base.carnum}}</p>
          </div>
          <div class="itemmenu">
            <span
              class="itemmenuitem"
              :style="{color: val.data.base.workstatus.color}"
            >{{val.data.base.workstatus.name}}</span>
            <span class="itemmenuitem paddingmenu">/</span>
            <span
              class="itemmenuitem"
              :style="{color: val.data.base.carstatus.color}"
            >{{val.data.base.carstatus.name}}</span>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-pagination class="pagination" small :pager-count="5" layout="prev, pager, next" :page-size="page.size" :total="mainlist.length"
     @current-change="PageChange" :hide-on-single-page="true" ></el-pagination>
  </div>
</template>
<script>
export default {
  name: "carList",
  data: function() {
    return {
      page: {
        current: 1,
        size: 50
      },
      list: []
    };
  },
  props: {
    toptitle: {
      type: String,
      default: ""
    },
    mainlist: {
      type: Array,
      default: []
    }
  },
  watch: {
    mainlist: function() {
      this.getlist();
    }
  },
  mounted: function() {
    this.getlist();
  },
  methods: {
    getlist() {
      this.list = [];
      let start = (this.page.current - 1) * this.page.size;
      let end = start + this.page.size;
      this.list = this.mainlist.slice(start, end);
    },
    PageChange(current) {
      this.page.current = current;
      this.getlist();
    },
    FuncClick(val) {
      // 触发父组件的方法
      this.$emit('click', 'click', val);
    }
  }
};
</script>

<style lang="scss" scope>
@import "@/localstyles/element.scss";
.el-autocomplete{
	width:100%
}
@mixin pagination($width: 100%, $height: 36px, $background: #fff) {
  width: $width;
  height: $height;
  background: $background;
  @include flex($main: center, $cross: center);
  * {
    background: $background !important;
    color: #afb2b9;
  }
}
.mainlist {
  @include mainlist($listheight: 300px, $titleheight: 42px);
  .title {
    color: rgba(255, 255, 255, 0.7);
  }
  .list {
    padding: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  .item {
    color: rgba($color: #fff, $alpha: 0.6);
    padding: 0 10px;
    &:hover {
      background: rgba($color: #4fd7a7, $alpha: 0.2);
    }
    &.itemchoice{
      background: rgba($color: #4fd7a7, $alpha: 0.3);
    }
  }
  .paddingmenu {
    padding: 0 2px;
  }
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .pagination {
    opacity: 0.97;
    @include pagination($height: 28px, $background: #1e202f);
  }
}
// #afb2b9 !important
</style>