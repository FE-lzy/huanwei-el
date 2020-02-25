<template>
  <div class="app-container">
    <v-button type="primary">测试</v-button>
    <img v-for="(i,k) in imgData" :key="k" :src="_mainmod.formatType.GetDeviceIcon(i)" />
    <img :src="imgurl" />
  </div>
</template>
<script>
export default {
  name: "example",
  data(){
    return{
      imgurl:this._mainmod.formatType.GetDeviceIcon("trash",'finished'),
      imgData:[
        'water','wc','gas',
        'trash','trash-finished','trash-unfinished',
        'burn','landfill','park','transfer'
      ]
    }
  },
  mounted() {
    console.log(
      this._mainmod.formatType.GetDeviceIcon("trash")
    );
  },
  methods: {
    handleClick() {
      console.log("1");
    }
  }
};
</script>
