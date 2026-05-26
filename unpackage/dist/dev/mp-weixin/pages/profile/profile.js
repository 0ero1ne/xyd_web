"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      isLoggedIn: false,
      role: "farmer",
      userInfo: {
        avatarUrl: "",
        nickname: ""
      },
      settings: [
        { title: "个人资料", description: "完善个人信息", url: "/pages/profile/edit-profile", login: true },
        { title: "服务地址", description: "设置常用作业地点", url: "/pages/profile/addresses", login: true },
        { title: "消息通知", description: "管理提醒方式", url: "/pages/profile/notifications", login: true },
        { title: "账号与安全", description: "隐私与登录安全", url: "/pages/profile/security", login: true },
        { title: "帮助与客服", description: "常见问题与反馈", url: "/pages/profile/help", login: false }
      ]
    };
  },
  computed: {
    roleName() {
      return this.role === "farmer" ? "农户用户" : "无人机飞手";
    },
    description() {
      return this.role === "farmer" ? "需求发布方" : "专业服务方";
    },
    statusText() {
      return this.isLoggedIn ? `已登录 · ${this.roleName} · ${this.description}` : "可先浏览服务，按需选择登录";
    }
  },
  onShow() {
    this.isLoggedIn = Boolean(common_vendor.index.getStorageSync("token"));
    this.role = common_vendor.index.getStorageSync("planeUserRole") || "farmer";
    this.userInfo = common_vendor.index.getStorageSync("userInfo") || {
      avatarUrl: "",
      nickname: ""
    };
    const addresses = common_vendor.index.getStorageSync("planeServiceAddresses") || [];
    const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
    this.settings[0].description = this.isLoggedIn && this.userInfo.nickname ? this.userInfo.nickname : "完善个人信息";
    this.settings[1].description = this.isLoggedIn && defaultAddress ? defaultAddress.name : "设置常用作业地点";
  },
  methods: {
    openSetting(item) {
      if (item.login && !this.isLoggedIn) {
        common_vendor.index.showModal({
          title: "登录后使用",
          content: "该功能需要登录后管理，您可以继续浏览或主动登录。",
          cancelText: "暂不登录",
          confirmText: "去登录",
          success: (result) => {
            if (result.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/index/index" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({ url: item.url });
    },
    handleAccountAction() {
      if (this.isLoggedIn) {
        this.logout();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/index/index"
      });
    },
    logout() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("planeUserRole");
      common_vendor.index.removeStorageSync("planeUserRoleName");
      common_vendor.index.removeStorageSync("planeWechatUser");
      this.isLoggedIn = false;
      common_vendor.index.switchTab({
        url: "/pages/menu/menu"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLoggedIn && $data.userInfo.avatarUrl
  }, $data.isLoggedIn && $data.userInfo.avatarUrl ? {
    b: $data.userInfo.avatarUrl
  } : {
    c: common_vendor.t($data.isLoggedIn ? $data.role === "farmer" ? "农" : "飞" : "访")
  }, {
    d: common_vendor.t($data.isLoggedIn ? $data.userInfo.nickname || $options.roleName : "游客用户"),
    e: common_vendor.t($options.statusText),
    f: common_vendor.f($data.settings, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.description),
        c: item.url,
        d: common_vendor.o(($event) => $options.openSetting(item), item.url)
      };
    }),
    g: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {} : {}, {
    h: common_vendor.t($data.isLoggedIn ? "切换身份 / 退出登录" : "自愿登录并使用完整服务"),
    i: common_vendor.o((...args) => $options.handleAccountAction && $options.handleAccountAction(...args), "62")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
