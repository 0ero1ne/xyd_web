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
      settings: ["个人资料", "服务地址", "消息通知", "账号与安全", "帮助与客服"]
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
  },
  methods: {
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
    f: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    g: common_vendor.f($data.settings, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: item
      };
    })
  } : {}, {
    h: common_vendor.t($data.isLoggedIn ? "切换身份 / 退出登录" : "自愿登录并使用完整服务"),
    i: common_vendor.o((...args) => $options.handleAccountAction && $options.handleAccountAction(...args), "89")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
