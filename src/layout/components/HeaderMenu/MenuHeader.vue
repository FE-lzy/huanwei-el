<template>
  <section class="menu-header">
    <el-menu
      :default-active="parentPath"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#2F2E4B"
      text-color="#fff"
      active-text-color="#4FD7A7"
    >
      <!-- <app-link> -->
      <el-menu-item
        v-for="route in routes"
        :key="route.path"
        :item="route"
        :base-path="route.path"
        v-if="!route.hidden"
        :index="route.path"
      >
        <router-link :to="route.path">{{route.name}}</router-link>
      </el-menu-item>
    </el-menu>
  </section>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "MenuHeader",
  data(){
    return{
      parentPath:'/'
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      let routerArr = [];
      // console.log(key, keyPath);
      for (let i = 0; i < this.routes.length; i++) {
        if (!this.routes[i].hidden) {
          if (this.routes[i].path == key) {
            routerArr = this.routes[i].children;
            routerArr.parentPath = key;
          }
        }
      }
      //   当前选中一级菜单的子菜单
      this.$store.state.routers.childRouter = routerArr;
      this.$router.push(key);
    }
  },
  mounted() {
    let parentPath = '/' + this.$route.path.split('/')[1]
    if (parentPath) {
      let routerArr = [];
      for (let i = 0; i < this.routes.length; i++) {
        if (this.routes[i].path == parentPath) {
          routerArr = this.routes[i].children;
          routerArr.parentPath = parentPath;
          this.parentPath = parentPath;
        }
      }
      // console.log(parentPath);
      // console.log(this.$store.state.routers.childRouter);
      this.$store.state.routers.childRouter = routerArr;
    }
  },
  computed: {
    routes() {
      return this.$router.options.routes;
    }
  }
};
</script>
<style scoped>
.el-menu.el-menu--horizontal{
  border-bottom: none
}
</style>
