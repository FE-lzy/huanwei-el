<template>
  <div class="login-container">
    <div class="leftdiv">
      <img class="leftlogo" src="@/assets/image/logo.png" alt />
    </div>
    <div class="rightdiv">
      <div class="logindiv">
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          auto-complete="on"
          label-position="left"
        >
          <div class="title-container">
            <div class="title">登录</div>
          </div>

          <el-form-item class="formlist" prop="userName">
            <span class="formsvg">
              <i class="el-icon-user"></i>
            </span>
            <el-input
              class="forminput"
              clearable
              ref="userName"
              v-model="loginForm.userName"
              placeholder="请输入"
              name="userName"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>

          <el-form-item class="formlist" prop="password">
            <span class="formsvg">
              <i class="el-icon-lock"></i>
            </span>
            <el-input
              class="forminput"
              :key="passwordType"
              show-password
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="请输入"
              name="password"
              tabindex="2"
              auto-complete="on"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>

          <el-button
            :loading="loading"
            class="btnLogin"
            @click.native.prevent="handleLogin"
          >登&nbsp;&nbsp;&nbsp;录</el-button>
        </el-form>
      </div>
    </div>
    <!-- <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">Login Form</h3>
      </div>

      <el-form-item prop="userName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="userName"
          v-model="loginForm.userName"
          placeholder="userName"
          name="userName"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        style="width:100%;margin-bottom:30px;"
        @click.native.prevent="handleLogin"
      >Login</el-button>

      <div class="tips">
        <span style="margin-right:20px;">userName: admin</span>
        <span>password: any</span>
      </div>
    </el-form>-->
  </div>
</template>

<script>

export default {
  name: "Login",
  data() {
    const validateuserName = (rule, value, callback) => {
      if (value.length < 3) {
        callback(new Error("用户名不少于3位"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码不少于6位"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        userName: "test",
        password: "test123"
      },
      loginRules: {
        userName: [
          { required: true, trigger: "blur", validator: validateuserName }
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword }
        ]
      },
      loading: false,
      passwordType: "password",
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  // .login-container .el-input input {
  //   color: $cursor;
  // }
}

/* reset element-ui css */
.login-container {
  .leftdiv {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 60%;
    background: url(~@/assets/image/login_left.jpg) no-repeat;
    background-size: 100% 100%;
  }
  .leftlogo {
    margin-top: 5%;
    margin-left: 5%;
    width: 20%;
  }
  .rightdiv {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 40%;
    background: url(~@/assets/image/login_right.jpg) no-repeat;
    background-size: 100% 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .btnLogin {
    width: 70%;
    margin: 0 15%;
    border: 1px solid #ccc !important;
  }
  .logindiv {
    height: 310px;
    width: 340px;
    border-radius: 5px;
    padding: 20px 25px;
    background-color: #fff;
    text-align: left;
  }
  .title {
    text-align: center;
    margin-bottom: 30px;
    color: #6aacf5;
    font-size: 24px;
  }
  .formlist {
    border: 1px #ccc solid;
  }
  .formsvg {
    padding: 0 10px 0 20px;
    vertical-align: middle;
    height: 50px;
    display: inline-block;
    line-height: 50px;
    font-size: 22px;
    color: #ccc;
  }
  .forminput {
    width: 220px;
  }
  .forminput >>> input {
    height: 50px;
    line-height: 50px;
    border: none;
  }
  .el-input__inner {
    border: none !important;
  }
}
</style>
