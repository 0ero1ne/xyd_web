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
      activeStatus: "all",
      tabs: [
        { label: "全部", value: "all" },
        { label: "进行中", value: "running" },
        { label: "已完成", value: "completed" }
      ],
      orders: [],
      loading: false,
      completingOrderId: null,
      cancelingOrderId: null,
      page: 1,
      size: 10,
      hasMore: true
    };
  },
  onShow() {
    this.activeStatus = "all";
    this.loadOrders(true);
  },
  onPullDownRefresh() {
    this.loadOrders(true).finally(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    if (!this.loading && this.hasMore) {
      this.loadOrders(false);
    }
  },
  methods: {
    changeTab(status) {
      if (this.activeStatus === status) {
        return;
      }
      this.activeStatus = status;
      this.loadOrders(true);
    },
    loadOrders(reset = false) {
      if (this.loading) {
        return Promise.resolve();
      }
      if (reset) {
        this.page = 1;
        this.hasMore = true;
      }
      this.loading = true;
      return api_order.getMyOrders({
        status: this.activeStatus,
        page: this.page,
        size: this.size
      }).then((response) => {
        const data = unwrapData(response) || {};
        const records = Array.isArray(data.records) ? data.records : [];
        this.orders = reset ? records : this.orders.concat(records);
        const total = Number(data.total || 0);
        const currentPage = Number(data.page || this.page);
        const pageSize = Number(data.size || this.size);
        this.page = currentPage + 1;
        this.hasMore = total ? this.orders.length < total : records.length >= pageSize;
      }).catch(() => {
        if (reset) {
          this.orders = [];
        }
        common_vendor.index.showToast({
          title: "订单加载失败",
          icon: "none"
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    formatOrderNo(orderNo) {
      if (!orderNo) {
        return "--";
      }
      const text = String(orderNo);
      return text.length > 10 ? text.slice(-10) : text;
    },
    formatArea(areaMu) {
      return `${isPresent(areaMu) ? areaMu : "--"} 亩`;
    },
    formatIncome(order) {
      const income = isPresent(order.actualIncome) ? order.actualIncome : order.expectedIncome;
      return `¥${isPresent(income) ? income : "--"}`;
    },
    formatOrderTime(order) {
      const time = order.completedTime || order.acceptedTime || order.createTime;
      if (!time) {
        return "--";
      }
      const date = new Date(String(time).replace(/-/g, "/"));
      if (Number.isNaN(date.getTime())) {
        return "--";
      }
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hour}:${minute}`;
    },
    formatStatusLabel(order) {
      if (order && order.statusLabel) {
        return order.statusLabel;
      }
      const statusMap = {
        0: "已取消",
        1: "进行中",
        2: "进行中",
        3: "已完成"
      };
      return statusMap[order && order.orderStatus] || "未知";
    },
    statusClass(order) {
      const label = order.statusLabel || "";
      if (label.indexOf("取消") !== -1 || order.orderStatus === 0) {
        return "cancelled";
      }
      if (label.indexOf("完成") !== -1 || order.orderStatus === 3) {
        return "completed";
      }
      return "running";
    },
    canComplete(order) {
      return order && (order.orderStatus === 1 || order.orderStatus === 2);
    },
    canCancel(order) {
      return order && (order.orderStatus === 1 || order.orderStatus === 2);
    },
    handleCompleteOrder(order) {
      if (!order || !order.orderId || this.completingOrderId) {
        return;
      }
      common_vendor.index.showModal({
        title: "确认完成",
        content: "确认该任务已经完成吗？",
        success: (result) => {
          if (result.confirm) {
            this.submitCompleteOrder(order.orderId);
          }
        }
      });
    },
    submitCompleteOrder(orderId) {
      this.completingOrderId = orderId;
      api_order.completeOrder(orderId).then((response) => {
        unwrapData(response);
        common_vendor.index.showToast({
          title: "已完成",
          icon: "success"
        });
        this.loadOrders(true);
      }).catch(() => {
        common_vendor.index.showToast({
          title: "订单操作失败",
          icon: "none"
        });
      }).finally(() => {
        this.completingOrderId = null;
      });
    },
    handleCancelOrder(order) {
      if (!order || !order.orderId || this.cancelingOrderId) {
        return;
      }
      common_vendor.index.showModal({
        title: "确认取消",
        content: "取消后该订单将不计入收入，是否继续？",
        success: (result) => {
          if (result.confirm) {
            this.submitCancelOrder(order.orderId);
          }
        }
      });
    },
    submitCancelOrder(orderId) {
      const cancelReason = "用户主动取消";
      this.cancelingOrderId = orderId;
      api_order.cancelOrder(orderId, cancelReason).then((response) => {
        unwrapData(response);
        common_vendor.index.showToast({
          title: "已取消",
          icon: "success"
        });
        this.loadOrders(true);
      }).catch(() => {
        common_vendor.index.showToast({
          title: "订单操作失败",
          icon: "none"
        });
      }).finally(() => {
        this.cancelingOrderId = null;
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.label),
        b: tab.value,
        c: $data.activeStatus === tab.value ? 1 : "",
        d: common_vendor.o(($event) => $options.changeTab(tab.value), tab.value)
      };
    }),
    b: $data.loading && $data.page === 1
  }, $data.loading && $data.page === 1 ? {} : !$data.orders.length ? {} : common_vendor.e({
    d: common_vendor.f($data.orders, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.formatOrderNo(order.orderNo)),
        b: common_vendor.t($options.formatStatusLabel(order)),
        c: common_vendor.n($options.statusClass(order)),
        d: common_vendor.t(order.taskTitle || "未命名任务"),
        e: common_vendor.t(order.locationName || "未知地点"),
        f: common_vendor.t($options.formatArea(order.areaMu)),
        g: common_vendor.t($options.formatOrderTime(order)),
        h: common_vendor.t($options.formatIncome(order)),
        i: $options.canComplete(order)
      }, $options.canComplete(order) ? {
        j: $data.completingOrderId === order.orderId,
        k: common_vendor.o(($event) => $options.handleCompleteOrder(order), order.orderId || order.orderNo)
      } : {}, {
        l: $options.canCancel(order)
      }, $options.canCancel(order) ? {
        m: $data.cancelingOrderId === order.orderId,
        n: common_vendor.o(($event) => $options.handleCancelOrder(order), order.orderId || order.orderNo)
      } : {}, {
        o: order.orderId || order.orderNo
      });
    }),
    e: $data.loading
  }, $data.loading ? {} : !$data.hasMore ? {} : {}, {
    f: !$data.hasMore
  }), {
    c: !$data.orders.length
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1acc51a1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/orders/orders.js.map
