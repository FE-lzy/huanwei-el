<style scoped lang="scss">

</style>
<template>
  <baseview :act="'add'" :pageleave="pageleave"  />
</template>

<script>
import baseview from "./base";

export default {
  name: "devicebuild",
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
    this.$nextTick(() => {
    });
  },
  methods: {

  },
  beforeRouteLeave(to, from, next) {
    if (this.pageleave.callback) {
      this.pageleave.callback();
    }
    next();
  }
};
</script>


