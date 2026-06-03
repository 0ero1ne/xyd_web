"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  data() {
    return { phone: "", isWechatBound: false, isBindingWechat: false };
  },
  computed: { maskedPhone() {
    return this.phone ? this.phone.includes("*") ? this.phone : `${this.phone.slice(0, 3)}****${this.phone.slice(-4)}` : "未填写，点击设置";
  } },
  onShow() {
    this.loadAccountInfo();
  },
  methods: {
    getData(response) {
      return response && response.data !== void 0 ? response.data : response;
    },
    loadAccountInfo() {
      api_user.getAccountInfo().then((response) => {
        const data = this.getData(response) || {};
        this.phone = data.maskedPhone || data.phone || "";
        this.isWechatBound = data.wechatBound === true || data.isWechatBound === true || data.wechatBindStatus === "已绑定" || data.bindStatus === "已绑定";
      }).catch(() => {
      });
    },
    handleWechatAccount() {
      if (this.isWechatBound) {
        common_vendor.index.showToast({ title: "微信账号已绑定", icon: "none" });
        return;
      }
      if (this.isBindingWechat)
        return;
      this.isBindingWechat = true;
      common_vendor.index.login({
        provider: "weixin",
        success: async (res) => {
          try {
            if (!res.code) {
              common_vendor.index.showToast({ title: "未获取到微信授权码", icon: "none" });
              return;
            }
            await api_user.bindWechatAccount(res.code);
            common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
            this.loadAccountInfo();
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/profile/security.vue:51", "bindWechatAccount failed", error);
          } finally {
            this.isBindingWechat = false;
          }
        },
        fail: () => {
          this.isBindingWechat = false;
          common_vendor.index.showToast({ title: "微信登录失败", icon: "none" });
        }
      });
    },
    editProfile() {
      common_vendor.index.navigateTo({ url: "/pages/profile/edit-profile" });
    },
    privacy() {
      common_vendor.index.showModal({ title: "信息使用说明", content: "头像、昵称、电话和服务区域用于飞手账号展示、订单沟通与作业服务。", showCancel: false });
    },
    clearData() {
      common_vendor.index.showModal({ title: "清除资料", content: "将清除本地飞手资料和服务区域，是否继续？", success: (result) => {
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
      common_vendor.index.showModal({ title: "退出登录", content: "退出后需要重新登录才能使用飞手接单服务。", success: (result) => {
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
    b: common_vendor.o((...args) => $options.handleWechatAccount && $options.handleWechatAccount(...args), "d9"),
    c: common_vendor.t($options.maskedPhone),
    d: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args), "5b"),
    e: common_vendor.o((...args) => $options.privacy && $options.privacy(...args), "d1"),
    f: common_vendor.o((...args) => $options.clearData && $options.clearData(...args), "ea"),
    g: common_vendor.o((...args) => $options.logout && $options.logout(...args), "50")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f3856239"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/security.js.map
