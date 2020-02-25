<template>
  <div>
    <svg-icon :icon-class="isFullscreen ? 'exit-fullscreen':'fullscreen'" @click="click" />
  </div>
</template>

<script>
import screenfull from "screenfull";
import { mapGetters } from "vuex";
export default {
  name: "Screenfull",
  data() {
    return {
      isFullscreen: false
    };
  },
  computed: {
    ...mapGetters(["screenful"])
  },
  created() {
    
  },
  mounted() {
    this.init();
    // console.log(this.$st);
  },
  beforeDestroy() {
    this.destroy();
  },
  methods: {
    click() {
      if (!screenfull.isEnabled) {
        this._func.showmsg("您的浏览器不支持全屏", "warning");
        return false;
      }
      screenfull.toggle();
    },
    change() {
      this.isFullscreen = screenfull.isFullscreen;
      console.log(screenfull.isFullscreen);
      this.$store.dispatch("app/toggleScreenful", this.isFullscreen);
    },
    init() {
      if (screenfull.isEnabled) {
        screenfull.on("change", this.change);
      }
    },
    destroy() {
      if (screenfull.isEnabled) {
        screenfull.off("change", this.change);
      }
    }
  }
};
</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
.svg-icon {
  font-size: 36px !important;
  vertical-align: -0.3em !important;
}
</style>
