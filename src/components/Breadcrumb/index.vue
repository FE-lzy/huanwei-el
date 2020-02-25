<template>
  <div class="mainbreadmain">
    <el-breadcrumb class="app-breadcrumb" separator="/">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item) in levelList" :key="item.path">
          <span v-if="item.redirect==='noRedirect'|| item.meta.last" class="no-redirect" @click.prevent="handleLink(item)">{{ item.meta.title }}</span>
          <span v-else class="linka" @click.prevent="handleLink(item)">{{ item.meta.title }}</span>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script>
import pathToRegexp from 'path-to-regexp'

export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0];
      if (!this.isDashboard(first)) {
        matched = [{ path: '/', meta: { title: '' }}].concat(matched)
      }
      matched = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false);
      this.levelList = [];
      let currentroute = matched[matched.length - 1];
      let level = currentroute.meta.breadlevel;
      this.$emit('backmenu', currentroute.meta.backmenu);
      for (let i = 0; i < matched.length; i++) {
        if (level && level[i] === 0) {
        } else {
          if (i == matched.length - 1) {
            matched[i].meta.last = true;
          } else {
            matched[i].meta.last = false;
          }
          this.levelList.push(matched[i]);
        }
      }
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #fff;
    cursor: text;
  }
}
.linka{ color: #fff !important; cursor: pointer !important; }
</style>
