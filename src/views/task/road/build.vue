<style scoped lang="scss">

</style>
<template>
  <baseview :act="'add'" :pageleave="pageleave"  />
</template>

<script>
import baseview from "@/views/task/road/base";

export default {
  name: "roadbuild",
  components: {
    baseview
  },
  data() {
    return {
      pageleave: {
        callback: null
      }
    };
  },
  mounted: function() {
    this.MainmodLoad();
    this.$nextTick(() => {
    });
  },
   methods: {
    MainmodLoad() {
      this._mainmod.depend
        .LoadMod({
          page: "road",
          modlist: ["formatType", "modcar", "modroad"]
        })
        .then(res => {}, res => {});
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


