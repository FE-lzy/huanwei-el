<style scoped lang="scss">

</style>
<template>
  <baseview :act="'update'" :itemdata="$route.params.itemdata" :pageleave="pageleave"  />
</template>

<script>
import baseview from "./base";

export default {
  name: "deviceedit",
  components: {
    baseview
  },
  data() {
    return {
      pageleave: {
        callback: null
      },
      itemdata: {
        
      }
    };
  },
  mounted: function() {
    this.SetItemdata();
  },
  methods: {
    SetItemdata() {
      if (!this.$route.params.itemdata) {
        this._func.FuncLink('router', '/info/device/list');
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.pageleave.callback) {
      this.pageleave.callback();
    }
    next();
  }
};
</script>
