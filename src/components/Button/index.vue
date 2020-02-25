<template>
  <div class="v-button">
    <el-tooltip
      :disabled="disabled ? false : true"
      class="item"
      effect="dark"
      :content="tooltip"
      placement="top-start"
    >
      <div>
        <button
          @click="handleClick"
          :disabled="buttonDisabled || loading"
          :class="[ type ? 'v-type-' + type : '',size ? 'v-size-' + size : '',
        {
          'is-disabled':disabled,
          'is-loading':loading,
          'is-plain':plain
        }
        
      ]"
          :size="size"
          :type="type"
        >
          <i class="el-icon-loading" style="display:inline-flex" v-if="loading"></i>
          <i :class="icon" v-if="icon && !loading"></i>
          <slot />
        </button>
      </div>
    </el-tooltip>
  </div>
</template>
<script>
export default {
  name: "button1",
  props: {
    size: {
      type: String,
      default: "medium" //中等默认
    },
    type: {
      type: String,
      default: "defualt"
    },
    tooltip: {
      type: String,
      default: "请先选择"
    },
    icon: String,
    disabled: Boolean,
    loading: Boolean,
    plain: Boolean
  },
  // 计算属性
  computed: {
    buttonDisabled() {
      return this.disabled;
    }
  },
  data() {
    return {
      btnClass: "default", //默认
      sizeClass: this.size, //大小
      typeClass: this.type // 类型
    };
  },
  methods: {
    handleClick(evt) {
      this.$emit("click", evt);
    }
  }
};
</script>
<style lang="scss" scoped>
$themecolor: #4fd7a7;
.v-button {
  display: inline-block;
}
@mixin btn(
  $size: 14px,
  $color: #fff,
  $bgcolor: $themecolor,
  $radius: 5px,
  $bordercolor: $themecolor
) {
  background-color: $bgcolor;
  padding: 0 8px;
  border-radius: $radius;
  border: 1px solid $bordercolor;
  font-size: $size;
  color: $color;
  text-align: center;
  line-height: 1;
  display: inline-block;
}
// 主要
.v-type-primary {
  @include btn();
  &:hover {
    background: #52ecb6;
    border-color: #52ecb6;
  }
  &:active {
    background: #37b186;
    border-color: #37b186;
  }
}

// 标准
.v-type-defualt {
  @include btn(
    $bgcolor: #fff,
    $color: rgba($color: #000000, $alpha: 0.8),
    $bordercolor: rgba($color: #000000, $alpha: 0.1)
  );
  &:hover,
  &:active {
    background: rgba($color: #4fd7a7, $alpha: 0.2);
    color: rgba($color: #4fd7a7, $alpha: 1);
    border-color: rgba($color: #4fd7a7, $alpha: 0.5);
  }
  &:active {
    border-color: rgba($color: #4fd7a7, $alpha: 1);
  }
}
.v-type-text {
  @include btn(
    $bgcolor: #fff,
    $color: rgba($color: $themecolor, $alpha: 1),
    $bordercolor: rgba($color: #fff, $alpha: 1)
  );
  border: none !important;
  &:hover {
    color: #52ecb6;
  }
  &:active {
    color: #37b186;
  }
}
// 默认大小
.v-size-medium {
  height: 32px;
  min-width: 88px;
}
.v-size-big {
  height: 40px;
  min-width: 120px;
}
.v-size-small {
  font-size:12px;
  height: 24px;
  min-width: 68px;
}
.is-disabled {
  background: rgba($color: #fff, $alpha: 1);
  color: rgba($color: #000, $alpha: 0.3);
  border-color: rgba($color: #000, $alpha: 0.1);
  cursor: not-allowed;
  &:hover {
    background: rgba($color: #fff, $alpha: 1);
    color: rgba($color: #000, $alpha: 0.3);
    border-color: rgba($color: #000, $alpha: 0.1);
  }
}
.is-plain {
  @include btn(
    $bgcolor: rgba($color: #4fd7a7, $alpha: 0.2),
    $color: rgba($color: #4fd7a7, $alpha: 1),
    $bordercolor: rgba($color: #4fd7a7, $alpha: 1)
  );
  &:hover {
    background: rgba($color: #4fd7a7, $alpha: 0.2);
    color: rgba($color: #fff, $alpha: 1);
    border-color: rgba($color: #4fd7a7, $alpha: 1);
  }
  &:active {
    background: rgba($color: #4fd7a7, $alpha: 1);
    color: rgba($color: #fff, $alpha: 1);
    border-color: rgba($color: #4fd7a7, $alpha: 1);
  }
}

button {
  outline: none;
}
</style>