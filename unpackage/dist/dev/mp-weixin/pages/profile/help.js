"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      expanded: -1,
      feedback: "",
      faqs: [
        { q: "未登录可以浏览服务吗？", a: "可以，您可以先浏览公开服务，需要操作时再自行选择登录。" },
        { q: "如何新增服务地址？", a: "登录后进入“我的 - 服务地址”，点击新增并保存地点信息。" },
        { q: "如何关闭提醒？", a: "进入“消息通知”，分别调整需要接收的提醒开关。" }
      ]
    };
  },
  methods: {
    submit() {
      if (!this.feedback.trim())
        return common_vendor.index.showToast({ title: "请填写反馈内容", icon: "none" });
      const list = common_vendor.index.getStorageSync("planeFeedbackList") || [];
      list.unshift({ content: this.feedback.trim(), createdAt: Date.now() });
      common_vendor.index.setStorageSync("planeFeedbackList", list);
      this.feedback = "";
      common_vendor.index.showToast({ title: "反馈已记录", icon: "success" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.faqs, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.q),
        b: common_vendor.t($data.expanded === index ? "-" : "+"),
        c: $data.expanded === index
      }, $data.expanded === index ? {
        d: common_vendor.t(item.a)
      } : {}, {
        e: item.q,
        f: common_vendor.o(($event) => $data.expanded = $data.expanded === index ? -1 : index, item.q)
      });
    }),
    b: $data.feedback,
    c: common_vendor.o(($event) => $data.feedback = $event.detail.value, "78"),
    d: common_vendor.o((...args) => $options.submit && $options.submit(...args), "86")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6900f316"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/help.js.map
