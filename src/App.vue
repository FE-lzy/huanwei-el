<style lang="scss" >
@import "@/localstyles/element.scss";
* {
  margin: 0;
  padding: 0;
}
.js_demo{ position: fixed; top: 60px; left: 0; width: 100%; height: 100%; background-color: #ccc; z-index: 1000; @include flex($cross: center,$main: center); }
.mappop_div{ @include mappop(); background-color: #fff; }
</style>
<template>
  <div id="app">
    <router-view />
    <!-- <div class="js_demo">
      <div class="mappop_div">
        <div class="mappop_fixmenu mappop_link" >
          <p class="mappop_fixmenuicon"><i class="el-icon-close"></i></p>
        </div>
        <div class="mappop_title">
          <p>鲁L12360 ( 洒水车 )</p>
        </div>
        <div class="mappop_img">
          <img src='/images/carempty.png' />
        </div>
        <div class="mappop_area">
          <div class="mappop_menulist mappop_border">
            <div class="mappop_menuitem mappop_link">
              <p>轨迹</p>
            </div>
            <div class="mappop_menuitem mappop_link">
              <p>跟踪</p>
            </div>
            <div class="mappop_menuitem mappop_link">
              <p>视频</p>
            </div>
            <div class="mappop_menuitem mappop_link">
              <p>详情</p>
            </div>
          </div>
          <div class="mappop_list mappop_border">
            <div class="mappop_item">
              <div class="mappop_itemtitle">
                <p class="mappop_itemicon"><i class="el-icon-location"></i></p>
              </div>
              <div class="mappop_itemcontent">
                <p>山东省日照市东港区山顶路</p>
              </div>
            </div>
          </div>
          <div class="mappop_list">
            <div class="mappop_item">
              <div class="mappop_itemtitle">
                <p class="mappop_itemname">速度 :</p>
              </div>
              <div class="mappop_itemcontent">
                <p>4km/h</p>
              </div>
            </div>
            <div class="mappop_item">
              <div class="mappop_itemtitle">
                <p class="mappop_itemname">方向 :</p>
              </div>
              <div class="mappop_itemcontent">
                <p>正北</p>
              </div>
            </div>
          </div>
          <div class="mappop_list">
            <div class="mappop_item">
              <div class="mappop_itemtitle">
                <p class="mappop_itemname">油量 :</p>
              </div>
              <div class="mappop_itemcontent">
                <p>107.11L</p>
              </div>
            </div>
            <div class="mappop_item">
              <div class="mappop_itemtitle">
                <p class="mappop_itemname">状态 :</p>
              </div>
              <div class="mappop_itemcontent">
                <p>形式/作业</p>
              </div>
            </div>
          </div>
          <div class="mappop_list">
            <div class="mappop_item">
              <div class="mappop_itemtitle">
                <p class="mappop_itemname">定位时间 :</p>
              </div>
              <div class="mappop_itemcontent">
                <p>2019-08-28 11:53:36</p>
              </div>
            </div>
          </div>
        </div>
        <div class="mappop_angeldiv">
          <div class="mappop_angel"></div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>

export default {
  name: "App",
  methods: {
  }
};
</script>
