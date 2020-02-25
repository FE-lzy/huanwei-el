<template>
  <router-view />
</template>

<script>
export default {
  name: "taskcleanroute",
  data() {
    return {
    };
  },
  mounted() {
    this.MainmodLoad();
  },
  methods: {
    MainmodLoad() {
      this._mainmod.depend
        .LoadMod({
          page: "cleanroute",
          modlist: ["formatType", "modcar", "moddevice"]
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

