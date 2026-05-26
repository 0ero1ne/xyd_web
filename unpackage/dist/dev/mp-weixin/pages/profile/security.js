"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  data() {
    return { phone: "", isWechatBound: false };
  },
  computed: { maskedPhone() {
    return this.phone ? this.phone.includes("*") ? this.phone : `${this.phone.slice(0, 3)}****${this.phone.slice(-4)}` : "未填写，点击设置";
  } },
  onShow() {
    this.loadAccount();
  },
  methods: {
    getData(response) {
      return response && response.data !== void 0 ? response.data : response;
    },
    loadAccount() {
      utils_request.request({
        url: "/api/user/account",
        method: "GET"
      }).then((response) => {
        const data = this.getData(response) || {};
        this.phone = data.maskedPhone || data.phone || "";
        this.isWechatBound = data.wechatBound === true || data.isWechatBound === true || data.wechatBindStatus === "已绑定" || data.bindStatus === "已绑定";
      }).catch(() => {
      });
    },
    editProfile() {
      common_vendor.index.navigateTo({ url: "/pages/profile/edit-profile" });
    },
    privacy() {
      common_vendor.index.showModal({ title: "信息使用说明", content: "头像、昵称和主动填写的电话用于账户展示及服务联络；地址用于作业服务。", showCancel: false });
    },
    clearData() {
      common_vendor.index.showModal({ title: "清除资料", content: "将清除您填写的个人资料和服务地址，是否继续？", success: (result) => {
        if (!result.confirm)
          return;
        common_vendor.index.removeStorageSync("userInfo");
        common_vendor.index.removeStorageSync("addressList");
        common_vendor.index.removeStorageSync("planeProfileDetails");
        common_vendor.index.removeStorageSync("planeServiceAddresses");
        common_vendor.index.removeStorageSync("planeNotificationSettings");
        this.phone = "";
        common_vendor.index.showToast({ title: "资料已清除", icon: "none" });
      } });
    },
    logout() {
      common_vendor.index.showModal({ title: "退出登录", content: "退出后仍可继续浏览公开服务内容。", success: (result) => {
        if (!result.confirm)
          return;
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.removeStorageSync("userInfo");
        common_vendor.index.removeStorageSync("planeUserRole");
        common_vendor.index.removeStorageSync("planeUserRoleName");
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
      } });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.isWechatBound ? "已绑定" : "未绑定"),
    b: common_vendor.t($options.maskedPhone),
    c: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args), "dd"),
    d: common_vendor.o((...args) => $options.privacy && $options.privacy(...args), "60"),
    e: common_vendor.o((...args) => $options.clearData && $options.clearData(...args), "7d"),
    f: common_vendor.o((...args) => $options.logout && $options.logout(...args), "13")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f3856239"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/security.js.map
