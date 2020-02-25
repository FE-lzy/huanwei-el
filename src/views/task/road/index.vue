<template>
  <div class="device">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "taskroad",
  data() {
    return {
      com: "build"
    };
  },
  mounted() {
    // this._func.showload();
    this.MainmodLoad();
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
  }
};
</script>

<style scoped lang="scss">
.device {
  width: 100%;
  height: 100%;
}
</style>

