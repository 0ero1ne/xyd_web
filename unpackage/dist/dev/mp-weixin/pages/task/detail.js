"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
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
      taskId: "",
      task: {},
      loading: false,
      accepting: false
    };
  },
  computed: {
    canAccept() {
      return this.task && Number(this.task.status) === 1;
    },
    tags() {
      const tags = this.task && this.task.tags;
      if (Array.isArray(tags)) {
        return tags.filter(Boolean);
      }
      if (typeof tags === "string") {
        return tags.split(",").map((item) => item.trim()).filter(Boolean);
      }
      return [];
    }
  },
  onLoad(options) {
    this.taskId = options && options.id ? options.id : "";
    this.loadTaskDetail();
  },
  methods: {
    loadTaskDetail() {
      if (this.loading) {
        return;
      }
      if (!this.taskId) {
        common_vendor.index.showToast({
          title: "任务详情加载失败",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      common_vendor.wx$1.showLoading({
        title: "加载中",
        mask: true
      });
      api_task.getTaskDetail(this.taskId).then((response) => {
        this.task = unwrapData(response) || {};
      }).catch(() => {
        this.task = {};
        common_vendor.index.showToast({
          title: "任务详情加载失败",
          icon: "none"
        });
      }).finally(() => {
        common_vendor.wx$1.hideLoading();
        this.loading = false;
      });
    },
    handleAccept() {
      if (!this.canAccept || this.accepting) {
        return;
      }
      common_vendor.index.showModal({
        title: "确认接单",
        content: "是否确认接受该任务？",
        success: (result) => {
          if (result.confirm) {
            this.submitAccept();
          }
        }
      });
    },
    submitAccept() {
      this.accepting = true;
      api_order.acceptTask(this.taskId).then((response) => {
        unwrapData(response);
        common_vendor.index.showToast({
          title: "接单成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/orders/orders"
          });
        }, 500);
      }).catch((error) => {
        common_vendor.index.showToast({
          title: error && error.message ? error.message : "接单失败",
          icon: "none"
        });
      }).finally(() => {
        this.accepting = false;
      });
    },
    formatText(value) {
      return isPresent(value) ? value : "--";
    },
    formatUnit(value, unit) {
      return isPresent(value) ? `${value}${unit}` : "--";
    },
    formatMoney(value) {
      return `¥${isPresent(value) ? value : "--"}`;
    },
    formatStatus(task) {
      if (task && task.statusLabel) {
        return task.statusLabel;
      }
      const statusMap = {
        1: "待接单",
        2: "已接单",
        3: "进行中",
        4: "已完成",
        5: "已取消"
      };
      return statusMap[task && Number(task.status)] || "未知状态";
    },
    formatTime(value) {
      if (!value) {
        return "--";
      }
      const date = new Date(String(value).replace(/-/g, "/"));
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    joinAddress(locationName, detailAddress) {
      if (locationName && detailAddress && locationName !== detailAddress) {
        return `${locationName} ${detailAddress}`;
      }
      return locationName || detailAddress || "--";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : !$data.task.id ? {} : common_vendor.e({
    c: common_vendor.t($data.task.taskTitle || "未命名任务"),
    d: common_vendor.t($options.formatStatus($data.task)),
    e: $options.canAccept ? 1 : "",
    f: common_vendor.t($options.formatMoney($data.task.expectedIncome)),
    g: common_vendor.t($options.joinAddress($data.task.locationName, $data.task.detailAddress)),
    h: common_vendor.t($options.formatUnit($data.task.distanceKm, "km")),
    i: common_vendor.t($options.formatUnit($data.task.areaMu, "亩")),
    j: common_vendor.t($options.formatText($data.task.cropType)),
    k: common_vendor.t($options.formatText($data.task.serviceType)),
    l: common_vendor.t($options.formatTime($data.task.plannedStartTime)),
    m: common_vendor.t($options.formatTime($data.task.plannedEndTime)),
    n: common_vendor.t($options.formatTime($data.task.deadlineTime)),
    o: common_vendor.t($options.formatUnit($data.task.requiredBatteryCount, "组")),
    p: common_vendor.t($options.formatText($data.task.pesticideName)),
    q: common_vendor.t($options.formatText($data.task.pesticideDosage)),
    r: $options.tags.length
  }, $options.tags.length ? {
    s: common_vendor.f($options.tags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag),
        b: tag
      };
    })
  } : {}, {
    t: common_vendor.t($options.formatText($data.task.description)),
    v: common_vendor.t($options.formatText($data.task.contactName)),
    w: common_vendor.t($options.formatText($data.task.contactPhone))
  }), {
    b: !$data.task.id,
    x: common_vendor.t($options.canAccept ? "确认接单" : "当前任务不可接单"),
    y: !$options.canAccept ? 1 : "",
    z: !$options.canAccept || $data.accepting,
    A: common_vendor.o((...args) => $options.handleAccept && $options.handleAccept(...args), "4e")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-43b93a3d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/task/detail.js.map
