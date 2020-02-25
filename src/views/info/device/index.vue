<template>
  <div class="device">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'device',
  data() {
    return {
      com: 'build'
    };
  },
  mounted() {
    // this._func.showload();
    this.MainmodLoad();
  },
  methods: {
    MainmodLoad() {
      console.log('device page init');
      this._mainmod.depend.LoadMod({
        page: 'device',
        modlist: ['formatType', 'modcar', 'moddevice']
      }).then(res => {
        console.log(res);
      }, res => {
        console.log(res);
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    next();
  }
};
</script>

<style scoped lang="scss">
.device{ width: 100%; height: 100%; }
</style>

