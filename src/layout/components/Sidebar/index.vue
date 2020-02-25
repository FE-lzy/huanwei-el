<template>
<!-- <div class="siderBarContent"> -->
  <div :class="{'has-logo':showLogo}" >
    
   
    <el-scrollbar wrap-class="scrollbar-wrapper">
      
     <!-- <logo v-if="true" :collapse="isCollapse" /> -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        background-color="#1e202f"
        text-color="rgba(255,255,255,0.6)"
        active-text-color="rgba(255,255,255,1)"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="routes.parentPath"
        />
      </el-menu>
    </el-scrollbar>
     
    </div>
  <!-- </div> -->
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/styles/variables.scss";

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters(["sidebar"]),
    routes() {
      return this.$store.state.routers.childRouter;
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // console.log(meta, path);
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      let pathArr = path.split('\/');
      // 获取到二级菜单
      return (pathArr.length > 3) ? ('/'+ pathArr[1]+'/'+pathArr[2]) : path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    }
  }
};
</script>

<style lang="scss" scoped>
.betaCode{
  position: absolute;
  bottom: 40px;
  left: 30px;
}
</style>