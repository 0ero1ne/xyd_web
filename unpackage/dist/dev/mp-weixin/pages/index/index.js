"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  data() {
    return {
      selectedRole: "farmer",
      avatarUrl: "",
      nickname: "",
      agreementChecked: false,
      privacyAuthorized: false,
      isLoggingIn: false,
      roles: [
        {
          value: "farmer",
          label: "农户",
          icon: "田",
          description: "发布作业需求，查看服务进度"
        },
        {
          value: "pilot",
          label: "无人机飞手",
          icon: "飞",
          description: "选择附近任务，执行植保作业"
        }
      ]
    };
  },
  onShow() {
    const role = common_vendor.index.getStorageSync("planeUserRole");
    const userInfo = common_vendor.index.getStorageSync("userInfo");
    if (role) {
      this.selectedRole = role;
    }
    if (userInfo) {
      this.avatarUrl = userInfo.avatarUrl || "";
      this.nickname = userInfo.nickname || "";
    }
  },
  computed: {
    canCollectProfile() {
      return this.agreementChecked && this.privacyAuthorized;
    }
  },
  methods: {
    browseFirst() {
      common_vendor.index.switchTab({
        url: "/pages/menu/menu"
      });
    },
    onAgreementChange(event) {
      this.agreementChecked = event.detail.value.includes("accepted");
      if (!this.agreementChecked) {
        this.privacyAuthorized = false;
        return;
      }
      this.requirePrivacyAuthorization();
    },
    promptAgreement() {
      common_vendor.index.showToast({
        title: "请先阅读并同意协议",
        icon: "none"
      });
    },
    promptProfileAccess() {
      if (!this.agreementChecked) {
        this.promptAgreement();
        return;
      }
      this.requirePrivacyAuthorization();
    },
    requirePrivacyAuthorization() {
      if (common_vendor.wx$1.requirePrivacyAuthorize) {
        common_vendor.wx$1.requirePrivacyAuthorize({
          success: () => {
            this.privacyAuthorized = true;
          },
          fail: () => {
            this.agreementChecked = false;
            this.privacyAuthorized = false;
            common_vendor.index.showToast({
              title: "需同意隐私保护指引后继续",
              icon: "none"
            });
          }
        });
        return;
      }
      this.privacyAuthorized = true;
    },
    showDocument(type) {
      const isPrivacy = type === "privacy";
      common_vendor.index.showModal({
        title: isPrivacy ? "隐私政策" : "用户服务协议",
        content: isPrivacy ? "为完成微信登录和展示个人资料，我们会在您同意后收集您选择的头像、昵称及登录凭证，用于账户识别与页面展示。" : "使用本平台服务前，请确认您提供的信息真实有效，并遵守平台发布任务及服务交易相关规则。",
        showCancel: false,
        confirmText: "我已阅读"
      });
    },
    onChooseAvatar(event) {
      this.avatarUrl = event.detail.avatarUrl;
    },
    onNicknameInput(event) {
      this.nickname = event.detail.value;
    },
    login() {
      if (!this.agreementChecked) {
        this.promptAgreement();
        return;
      }
      if (!this.privacyAuthorized) {
        this.requirePrivacyAuthorization();
        return;
      }
      const nickname = this.nickname.trim();
      if (!this.avatarUrl) {
        common_vendor.index.showToast({
          title: "请选择微信头像",
          icon: "none"
        });
        return;
      }
      if (!nickname) {
        common_vendor.index.showToast({
          title: "请填写微信昵称",
          icon: "none"
        });
        return;
      }
      const role = this.roles.find((item) => item.value === this.selectedRole);
      this.isLoggingIn = true;
      common_vendor.index.login({
        provider: "weixin",
        success: (loginResult) => {
          if (!loginResult.code) {
            this.isLoggingIn = false;
            common_vendor.index.showToast({
              title: "未获取到微信登录凭证，请重试",
              icon: "none"
            });
            return;
          }
          this.requestWxLogin(loginResult.code, role, nickname);
        },
        fail: () => {
          this.isLoggingIn = false;
          common_vendor.index.showToast({
            title: "微信登录失败，请重试",
            icon: "none"
          });
        }
      });
    },
    requestWxLogin(code, role, nickname) {
      utils_request.request({
        url: "/api/auth/wx-login",
        method: "POST",
        data: {
          code,
          nickname,
          avatarUrl: this.avatarUrl
        }
      }).then((response) => {
        if (response.code !== 200 || !response.data || !response.data.token || !response.data.userInfo) {
          throw new Error(response.message || "登录失败，请重试");
        }
        this.completeLogin(role, response.data);
      }).catch((error) => {
        common_vendor.index.showToast({
          title: error.message || "登录失败，请重试",
          icon: "none"
        });
      }).finally(() => {
        this.isLoggingIn = false;
      });
    },
    completeLogin(role, loginData) {
      common_vendor.index.setStorageSync("token", loginData.token);
      common_vendor.index.setStorageSync("userInfo", loginData.userInfo);
      common_vendor.index.setStorageSync("planeUserRole", this.selectedRole);
      common_vendor.index.setStorageSync("planeUserRoleName", role.label);
      common_vendor.index.switchTab({
        url: "/pages/menu/menu"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$options.canCollectProfile
  }, !$options.canCollectProfile ? {
    b: common_vendor.o((...args) => $options.promptProfileAccess && $options.promptProfileAccess(...args), "99")
  } : common_vendor.e({
    c: $data.avatarUrl
  }, $data.avatarUrl ? {
    d: $data.avatarUrl
  } : {}, {
    e: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args), "c8")
  }), {
    f: $data.nickname,
    g: !$options.canCollectProfile,
    h: $options.canCollectProfile ? "点击选择微信昵称" : "请先阅读并同意协议",
    i: common_vendor.o((...args) => $options.onNicknameInput && $options.onNicknameInput(...args), "36"),
    j: common_vendor.f($data.roles, (role, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(role.icon),
        b: common_vendor.t(role.label),
        c: common_vendor.t(role.description),
        d: $data.selectedRole === role.value
      }, $data.selectedRole === role.value ? {} : {}, {
        e: $data.selectedRole === role.value ? 1 : "",
        f: role.value,
        g: $data.selectedRole === role.value ? 1 : "",
        h: common_vendor.o(($event) => $data.selectedRole = role.value, role.value)
      });
    }),
    k: $data.agreementChecked,
    l: common_vendor.o(($event) => $options.showDocument("service"), "cb"),
    m: common_vendor.o(($event) => $options.showDocument("privacy"), "2f"),
    n: common_vendor.o((...args) => $options.onAgreementChange && $options.onAgreementChange(...args), "cf"),
    o: common_vendor.t($data.isLoggingIn ? "登录中" : "微信登录并进入平台"),
    p: $data.isLoggingIn,
    q: $data.isLoggingIn,
    r: common_vendor.o((...args) => $options.login && $options.login(...args), "0f"),
    s: common_vendor.o((...args) => $options.browseFirst && $options.browseFirst(...args), "f9")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
