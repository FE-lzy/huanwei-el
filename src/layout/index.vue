<template>
  <div :class="classObj" class="app-wrapper" @keyup.>
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <div flex="dir:top">
      <div flex-box="0" flex class="topmenu" v-show="!screenful">
        <div class="logo" flex-box="0">
          <img
            class="toplogo"
            style="vertical-align: middle;margin-right:10px;margin-left:20px"
            src="@/assets/logo100.png"
          />
          <div class="topName" style="vertical-align: middle;">五征智慧环卫大数据运营平台</div>
        </div>
        <right-menu />
        <menu-header flex-box="1" class="menu" />
      </div>
      <sidebar class="sidebar-container" v-show="!screenful" />
      <div :class="screenful ? 'main-container_full' : 'main-container'">
        <div :class="screenful ? {'fixed-header_full':fixedHeader} : {'fixed-header':fixedHeader}">
          <navbar />
        </div>
        <app-main />
      </div>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain, MenuHeader, RightMenu } from "./components";
import ResizeMixin from "./mixin/ResizeHandler";
import { mapGetters } from "vuex";
export default {
  name: "Layout",
  components: {
    Navbar,
    Sidebar,
    AppMain,
    MenuHeader,
    RightMenu
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapGetters(["screenful"]),
    sidebar() {
      return this.$store.state.app.sidebar;
    },
    device() {
      return this.$store.state.app.device;
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader;
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === "mobile"
      };
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch("app/closeSideBar", { withoutAnimation: false });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";
@import "~@/localstyles/main.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.toplogo {
  width: 50px;
  height: 25px !important;
  display: inline-block;
}
.topName {
  color: #fff;
  font-size: 18px;
  display: inline-block;
  line-height: 60px;
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: $headerMenuHeight;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}
.fixed-header_full {
  position: fixed;
  right: 0;
  z-index: 9;
  width: 100%;
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
.topmenu {
  height: $headerMenuHeight;
  width: 100%;
  background: $headerMenuBgColor;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1022;
  .logo {
    height: $headerMenuHeight;
    width: 370px;
    float: left;
  }
  .menu {
    float: right;
    height: $headerMenuHeight;
  }
  .right {
    float: right;
    height: $headerMenuHeight;
  }
}
</style>
