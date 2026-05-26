"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      activeTab: "全部",
      tabs: ["全部", "进行中", "已完成"],
      orders: [
        {
          id: "订单 2026052501",
          status: "进行中",
          crop: "水稻病虫防治",
          address: "青禾村东侧 3 号田",
          area: "32 亩",
          date: "05-25 09:30",
          amount: "¥960"
        },
        {
          id: "订单 2026051803",
          status: "已完成",
          crop: "玉米叶面肥喷洒",
          address: "青禾村示范田",
          area: "18 亩",
          date: "05-18 15:00",
          amount: "¥540"
        }
      ]
    };
  },
  computed: {
    filteredOrders() {
      if (this.activeTab === "全部") {
        return this.orders;
      }
      return this.orders.filter((order) => order.status === this.activeTab);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab),
        b: tab,
        c: $data.activeTab === tab ? 1 : "",
        d: common_vendor.o(($event) => $data.activeTab = tab, tab)
      };
    }),
    b: common_vendor.f($options.filteredOrders, (order, k0, i0) => {
      return {
        a: common_vendor.t(order.id),
        b: common_vendor.t(order.status),
        c: common_vendor.t(order.crop),
        d: common_vendor.t(order.address),
        e: common_vendor.t(order.area),
        f: common_vendor.t(order.date),
        g: common_vendor.t(order.amount),
        h: order.id
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1acc51a1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/orders/orders.js.map
