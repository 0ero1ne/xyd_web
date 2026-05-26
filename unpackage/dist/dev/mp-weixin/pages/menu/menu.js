"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      role: "farmer"
    };
  },
  computed: {
    isFarmer() {
      return this.role === "farmer";
    },
    roleName() {
      return this.isFarmer ? "农户" : "飞手";
    },
    greeting() {
      return this.isFarmer ? "今天需要植保服务吗？" : "发现附近待接任务";
    },
    caption() {
      return this.isFarmer ? "一键发布地块作业，专业飞手快速响应" : "确认作物和面积，选择适合您的航线";
    },
    actionText() {
      return this.isFarmer ? "发布作业订单" : "查看可接订单";
    },
    listTitle() {
      return this.isFarmer ? "近期服务" : "推荐任务";
    },
    items() {
      return this.isFarmer ? [
        { title: "水稻病虫防治", detail: "东侧 3 号田 · 32 亩", price: "待报价" },
        { title: "玉米叶面肥喷洒", detail: "河边示范田 · 18 亩", price: "已完成" }
      ] : [
        { title: "水稻除虫喷洒", detail: "距您 2.3km · 32 亩", price: "¥960" },
        { title: "果园营养液喷施", detail: "距您 4.8km · 15 亩", price: "¥600" }
      ];
    }
  },
  onShow() {
    this.role = common_vendor.index.getStorageSync("planeUserRole") || "farmer";
  },
  methods: {
    handleAction() {
      if (common_vendor.index.getStorageSync("token")) {
        common_vendor.index.showToast({
          title: "功能开发中",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "登录后使用服务",
        content: "您可以继续浏览服务内容，发布或承接订单时再登录。",
        cancelText: "继续浏览",
        confirmText: "去登录",
        success: (result) => {
          if (result.confirm) {
            common_vendor.index.navigateTo({
              url: "/pages/index/index"
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.roleName),
    b: common_vendor.t($options.greeting),
    c: common_vendor.t($options.caption),
    d: common_vendor.t($options.actionText),
    e: common_vendor.o((...args) => $options.handleAction && $options.handleAction(...args), "e9"),
    f: common_vendor.t($options.listTitle),
    g: common_vendor.f($options.items, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.detail),
        c: common_vendor.t(item.price),
        d: item.title
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-388b40d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/menu/menu.js.map
