"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const PILOT_ROLE = {
  value: "pilot",
  label: "无人机飞手"
};
const _sfc_main = {
  data() {
    return {
      selectedRole: PILOT_ROLE.value,
      avatarUrl: "",
      nickname: "",
      agreementChecked: false,
      privacyAuthorized: false,
      isLoggingIn: false
    };
  },
  onShow() {
    const userInfo = common_vendor.index.getStorageSync("userInfo");
    this.selectedRole = PILOT_ROLE.value;
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
        content: isPrivacy ? "为完成微信登录和展示飞手资料，我们会在您同意后收集您选择的头像、昵称及登录凭证，用于账户识别与页面展示。" : "使用飞手端服务前，请确认您提供的信息真实有效，并遵守平台接单、履约及服务交易相关规则。",
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
      if (this.isLoggingIn) {
        return;
      }
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
      this.isLoggingIn = true;
      common_vendor.index.showLoading({
        title: "登录中",
        mask: true
      });
      common_vendor.index.login({
        provider: "weixin",
        success: (loginResult) => {
          if (!loginResult.code) {
            this.isLoggingIn = false;
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "未获取到微信登录凭证，请重试",
              icon: "none"
            });
            return;
          }
          this.requestWxLogin(loginResult.code, nickname);
        },
        fail: () => {
          this.isLoggingIn = false;
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "微信登录失败，请重试",
            icon: "none"
          });
        }
      });
    },
    requestWxLogin(code, nickname) {
      utils_request.request({
        url: "/api/auth/wx-login",
        method: "POST",
        data: {
          code,
          nickname,
          avatarUrl: this.avatarUrl,
          userIdentity: PILOT_ROLE.value
        }
      }).then((response) => {
        if (response.code !== 200 || !response.data || !response.data.token || !response.data.userInfo) {
          throw new Error(response.message || "登录失败，请重试");
        }
        this.completeLogin(response.data);
      }).catch((error) => {
        common_vendor.index.showToast({
          title: error.message || "登录失败，请重试",
          icon: "none"
        });
      }).finally(() => {
        this.isLoggingIn = false;
        common_vendor.index.hideLoading();
      });
    },
    completeLogin(loginData) {
      common_vendor.index.setStorageSync("token", loginData.token);
      common_vendor.index.setStorageSync("userInfo", loginData.userInfo);
      common_vendor.index.setStorageSync("planeUserRole", PILOT_ROLE.value);
      common_vendor.index.setStorageSync("planeUserRoleName", PILOT_ROLE.label);
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
    b: common_vendor.o((...args) => $options.promptProfileAccess && $options.promptProfileAccess(...args), "74")
  } : common_vendor.e({
    c: $data.avatarUrl
  }, $data.avatarUrl ? {
    d: $data.avatarUrl
  } : {}, {
    e: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args), "cb")
  }), {
    f: $data.nickname,
    g: !$options.canCollectProfile,
    h: $options.canCollectProfile ? "点击选择微信昵称" : "请先阅读并同意协议",
    i: common_vendor.o((...args) => $options.onNicknameInput && $options.onNicknameInput(...args), "04"),
    j: $data.agreementChecked,
    k: common_vendor.o(($event) => $options.showDocument("service"), "17"),
    l: common_vendor.o(($event) => $options.showDocument("privacy"), "6e"),
    m: common_vendor.o((...args) => $options.onAgreementChange && $options.onAgreementChange(...args), "2b"),
    n: common_vendor.t($data.isLoggingIn ? "登录中" : "微信登录并入住飞手端"),
    o: $data.isLoggingIn,
    p: $data.isLoggingIn,
    q: common_vendor.o((...args) => $options.login && $options.login(...args), "92")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
