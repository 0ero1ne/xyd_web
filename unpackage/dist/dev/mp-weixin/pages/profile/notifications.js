"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      settings: { order: true, system: true, promotion: true, quietHours: false },
      items: [
        { key: "order", title: "订单进度通知", desc: "接单、作业进度及完成状态提醒" },
        { key: "system", title: "系统通知", desc: "平台规则和账号安全相关消息" },
        { key: "promotion", title: "服务推荐", desc: "附近任务及植保服务信息" }
      ]
    };
  },
  onLoad() {
    this.settings = { ...this.settings, ...common_vendor.index.getStorageSync("planeNotificationSettings") || {} };
  },
  methods: {
    change(key, event) {
      this.settings[key] = event.detail.value;
      common_vendor.index.setStorageSync("planeNotificationSettings", this.settings);
      common_vendor.index.showToast({ title: "设置已保存", icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.items, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.desc),
        c: $data.settings[item.key],
        d: common_vendor.o(($event) => $options.change(item.key, $event), item.key),
        e: item.key
      };
    }),
    b: $data.settings.quietHours,
    c: common_vendor.o(($event) => $options.change("quietHours", $event), "7f")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b7870fea"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/notifications.js.map
