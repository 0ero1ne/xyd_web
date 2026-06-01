"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const isPresent = (value) => value !== void 0 && value !== null && value !== "";
const unwrapData = (response) => {
  if (response && response.code !== void 0 && response.code !== 200) {
    throw new Error(response.message || "请求失败");
  }
  return response && response.data !== void 0 ? response.data : response;
};
const _sfc_main = {
  data() {
    return {
      isLoggedIn: false,
      role: "pilot",
      incomeSummary: {
        totalIncome: 0,
        completedOrderCount: 0
      },
      userInfo: {
        avatarUrl: "",
        nickname: ""
      },
      settings: [
        { title: "飞手资料", description: "完善姓名、电话与展示信息", url: "/pages/profile/edit-profile", login: true },
        { title: "服务区域", description: "设置常驻作业地点", url: "/pages/profile/addresses", login: true },
        { title: "消息通知", description: "管理订单提醒方式", url: "/pages/profile/notifications", login: true },
        { title: "账号与安全", description: "隐私与登录安全", url: "/pages/profile/security", login: true },
        { title: "帮助与客服", description: "常见问题与反馈", url: "/pages/profile/help", login: false }
      ]
    };
  },
  computed: {
    roleName() {
      return "无人机飞手";
    },
    statusText() {
      return this.isLoggedIn ? `已登录 · ${this.roleName} · 专业服务方` : "登录后使用完整飞手服务";
    }
  },
  onShow() {
    this.isLoggedIn = Boolean(common_vendor.index.getStorageSync("token"));
    this.role = "pilot";
    this.userInfo = common_vendor.index.getStorageSync("userInfo") || {
      avatarUrl: "",
      nickname: ""
    };
    const addresses = common_vendor.index.getStorageSync("planeServiceAddresses") || [];
    const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
    this.settings[0].description = this.isLoggedIn && this.userInfo.nickname ? this.userInfo.nickname : "完善姓名、电话与展示信息";
    this.settings[1].description = this.isLoggedIn && defaultAddress ? defaultAddress.name : "设置常驻作业地点";
    common_vendor.index.setStorageSync("planeUserRole", "pilot");
    common_vendor.index.setStorageSync("planeUserRoleName", this.roleName);
    if (this.isLoggedIn) {
      this.loadIncomeSummary();
    } else {
      this.incomeSummary = {
        totalIncome: 0,
        completedOrderCount: 0
      };
    }
  },
  methods: {
    loadIncomeSummary() {
      api_order.getIncomeSummary().then((response) => {
        const data = unwrapData(response) || {};
        this.incomeSummary = {
          totalIncome: isPresent(data.totalIncome) ? data.totalIncome : 0,
          completedOrderCount: isPresent(data.completedOrderCount) ? data.completedOrderCount : 0
        };
      }).catch(() => {
        common_vendor.index.showToast({
          title: "收入加载失败",
          icon: "none"
        });
      });
    },
    formatIncomeValue(value) {
      return isPresent(value) ? value : 0;
    },
    openSetting(item) {
      if (item.login && !this.isLoggedIn) {
        common_vendor.index.showModal({
          title: "登录后使用",
          content: "该功能需要飞手登录后管理。",
          cancelText: "稍后再说",
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
    c: common_vendor.t($data.isLoggedIn ? "飞" : "入")
  }, {
    d: common_vendor.t($data.isLoggedIn ? $data.userInfo.nickname || $options.roleName : "飞手未登录"),
    e: common_vendor.t($options.statusText),
    f: common_vendor.t($options.formatIncomeValue($data.incomeSummary.totalIncome)),
    g: common_vendor.t($data.incomeSummary.completedOrderCount || 0),
    h: common_vendor.f($data.settings, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.description),
        c: item.url,
        d: common_vendor.o(($event) => $options.openSetting(item), item.url)
      };
    }),
    i: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {} : {}, {
    j: common_vendor.t($data.isLoggedIn ? "退出当前飞手账号" : "登录并入住飞手端"),
    k: common_vendor.o((...args) => $options.handleAccountAction && $options.handleAccountAction(...args), "0d")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
