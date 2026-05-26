"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  data() {
    return { role: "farmer", form: { avatarUrl: "", nickname: "", realName: "", phone: "", userIdentity: "" } };
  },
  computed: {
    roleName() {
      const identity = this.form.userIdentity || this.role;
      if (identity === "farmer")
        return "农户用户";
      if (identity === "pilot")
        return "无人机飞手";
      return identity;
    }
  },
  onLoad() {
    const user = common_vendor.index.getStorageSync("userInfo") || {};
    this.role = common_vendor.index.getStorageSync("planeUserRole") || "farmer";
    this.form.avatarUrl = user.avatarUrl || "";
    this.form.nickname = user.nickname || "";
    this.loadProfile();
  },
  methods: {
    chooseAvatar(event) {
      this.form.avatarUrl = event.detail.avatarUrl;
    },
    getData(response) {
      return response && response.data !== void 0 ? response.data : response;
    },
    loadProfile() {
      utils_request.request({
        url: "/api/user/profile",
        method: "GET"
      }).then((response) => {
        const data = this.getData(response) || {};
        this.form = {
          avatarUrl: data.avatarUrl || this.form.avatarUrl,
          nickname: data.nickname || this.form.nickname,
          realName: data.realName || "",
          phone: data.phone || "",
          userIdentity: data.userIdentity || ""
        };
        if (data.userIdentity) {
          common_vendor.index.setStorageSync("planeUserRoleName", data.userIdentity);
        }
      }).catch(() => {
      });
    },
    save() {
      const nickname = this.form.nickname.trim();
      if (!nickname)
        return common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
      if (this.form.phone && !/^1\d{10}$/.test(this.form.phone))
        return common_vendor.index.showToast({ title: "手机号格式不正确", icon: "none" });
      utils_request.request({
        url: "/api/user/profile",
        method: "PUT",
        data: {
          nickname,
          avatarUrl: this.form.avatarUrl,
          realName: this.form.realName.trim(),
          phone: this.form.phone,
          userIdentity: this.form.userIdentity || this.role
        }
      }).then(() => {
        common_vendor.index.setStorageSync("userInfo", {
          ...common_vendor.index.getStorageSync("userInfo") || {},
          avatarUrl: this.form.avatarUrl,
          nickname
        });
        common_vendor.index.setStorageSync("planeProfileDetails", {
          realName: this.form.realName.trim(),
          phone: this.form.phone
        });
        common_vendor.index.showToast({ title: "资料已保存", icon: "success" });
      }).catch(() => {
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.form.avatarUrl
  }, $data.form.avatarUrl ? {
    b: $data.form.avatarUrl
  } : {}, {
    c: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args), "db"),
    d: $data.form.nickname,
    e: common_vendor.o(($event) => $data.form.nickname = $event.detail.value, "48"),
    f: $data.form.realName,
    g: common_vendor.o(($event) => $data.form.realName = $event.detail.value, "99"),
    h: $data.form.phone,
    i: common_vendor.o(($event) => $data.form.phone = $event.detail.value, "85"),
    j: common_vendor.t($options.roleName),
    k: common_vendor.o((...args) => $options.save && $options.save(...args), "7b")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4438b7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/edit-profile.js.map
