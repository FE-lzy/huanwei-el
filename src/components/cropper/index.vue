<style scoped lang="scss">
@import "@/localstyles/element.scss";
.inputdiv {
  display: none;
}
.cropper-content {
  .cropper {
    width: auto;
    height: 300px;
  }
}

.cropper-container {
  .el-upload-list--picture-card .el-upload-list__item {
    width: 85px;
    height: 85px;
    line-height: 85px;
  }
  .el-upload--picture-card {
    width: 85px;
    height: 85px;
    line-height: 85px;
  }
  .el-upload--picture-card i {
    font-size: 20px;
  }
}
</style>
<template>
  <div class="cropper">
    <div class="inputdiv">
      <input type="file" ref="file" @change="FuncInput('change', $event)" accept="image/*" />
      <div ref="imglist"></div>
    </div>
    <div class="cropperdiv" @click="FuncAct('click')">
      <slot></slot>
    </div>
    <!-- 弹出层 -->
    <el-dialog title="图片剪裁" :visible.sync="act.show" append-to-body>
      <div class="cropper-content">
        <div class="cropper" style="text-align:center">
          <vueCropper
            ref="cropper"
            :img="cropper.option.img"
            :outputSize="cropper.option.size"
            :outputType="cropper.option.outputType"
            :info="true"
            :full="cropper.option.full"
            :canMove="cropper.option.canMove"
            :canMoveBox="cropper.option.canMoveBox"
            :original="cropper.option.original"
            :autoCrop="cropper.option.autoCrop"
            :fixed="cropper.option.fixed"
            :fixedNumber="cropper.option.fixedNumber"
            :centerBox="cropper.option.centerBox"
            :infoTrue="cropper.option.infoTrue"
            :fixedBox="cropper.option.fixedBox"
          ></vueCropper>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="FuncAct('hide')">取 消</el-button>
        <el-button type="primary" @click="CallBack">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "cropper",
  props: {
    type: {
      type: String,
      default: "FILE"
    }
  },
  data: function() {
    return {
      act: {
        show: false,
        // 防止重复提交
        loading: false
      },
      data: {
        file: null,
        filename: ""
      },
      picsList: [], // 页面显示的数组
      cropper: {
        option: {
          img: "", // 裁剪图片的地址
          info: true, // 裁剪框的大小信息
          outputSize: 0.8, // 裁剪生成图片的质量
          outputType: "jpeg", // 裁剪生成图片的格式
          canScale: false, // 图片是否允许滚轮缩放
          autoCrop: true, // 是否默认生成截图框
          // autoCropWidth: 300, // 默认生成截图框宽度
          // autoCropHeight: 200, // 默认生成截图框高度
          fixedBox: true, // 固定截图框大小 不允许改变
          fixed: true, // 是否开启截图框宽高固定比例
          fixedNumber: [16, 9], // 截图框的宽高比例
          full: true, // 是否输出原图比例的截图
          canMoveBox: false, // 截图框能否拖动
          original: false, // 上传图片按照原始比例渲染
          centerBox: true, // 截图框是否被限制在图片里面
          infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        }
      }
    };
  },
  mounted: function() {
    this.$nextTick(function() {});
  },
  methods: {
    FuncInput(act, e) {
      if (act == "click") {
        this.$refs["file"].click();
      } else if (act == "change") {
        let file = e.target.files[0];
        if (file) {
          if (file.type.indexOf('image/') > -1) {
            let name = file.name.split(".");
            for (let i = name.length - 1; i >= 0; i--) {
              if (!name[i]) {
                name.splice(i, 1);
              } else if (name[i]) {
                name.splice(i, 1);
                break;
              }
            }
            this.filename = name.join(".");
            let filesize = file.size / 1024;
            if (filesize <= 0) {
              this._func.showmsg("上传文件不能为空", "error");
            } else if (filesize > 3072) {
              this._func.showmsg("上传文件大小不能超过 3MB!", "error");
            } else {
              this._func.FuncFile("FILE", "DATAURL", file).then(res => {
                this.cropper.option.img = res.data;
                this.FuncAct("show");
                this.$refs["file"].value = "";
              });
            }
          } else {
            this._func.showmsg("请选择正确的图片文件", "error");
            this.$refs["file"].value = "";
          }
        }
      }
    },
    FuncAct(act) {
      if (act == "click") {
        this.FuncInput(act);
      } else if (act == "show") {
        this.act.show = true;
      } else if (act == "hide") {
        this.act.show = false;
      }
    },
    CallBack() {
      this.$refs.cropper.getCropBlob(data => {
        if (this.type != "BLOB") {
          this._func.FuncFile("BLOB", this.type, data, this.filename).then(res => {
            this.$emit("callback", "set", res.data);
            this.FuncAct("hide");
          });
        } else {
          this.$emit("callback", "set", data);
          this.FuncAct("hide");
        }
      });
    }
  }
};
</script>
