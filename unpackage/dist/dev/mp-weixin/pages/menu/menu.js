"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
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
      summaryLoading: false,
      tasksLoading: false,
      stats: [
        { value: "--km", label: "最近任务" },
        { value: "--亩", label: "单次面积" },
        { value: "¥--", label: "预估收入" }
      ],
      items: []
    };
  },
  onShow() {
    this.isLoggedIn = Boolean(common_vendor.index.getStorageSync("token"));
    common_vendor.index.setStorageSync("planeUserRole", "pilot");
    common_vendor.index.setStorageSync("planeUserRoleName", "无人机飞手");
    this.loadWorkbenchData();
  },
  methods: {
    loadWorkbenchData() {
      this.loadSummary();
      this.loadRecommendTasks();
    },
    loadSummary() {
      this.summaryLoading = true;
      api_task.getTaskSummary().then((response) => {
        this.stats = this.formatSummary(unwrapData(response) || {});
      }).catch(() => {
        common_vendor.index.showToast({
          title: "任务加载失败",
          icon: "none"
        });
      }).finally(() => {
        this.summaryLoading = false;
      });
    },
    loadRecommendTasks() {
      this.tasksLoading = true;
      api_task.getRecommendTasks().then((response) => {
        const data = unwrapData(response);
        const list = Array.isArray(data) ? data : [];
        this.items = list.map((item) => this.formatTask(item));
      }).catch(() => {
        this.items = [];
        common_vendor.index.showToast({
          title: "任务加载失败",
          icon: "none"
        });
      }).finally(() => {
        this.tasksLoading = false;
      });
    },
    formatSummary(summary) {
      return [
        { value: `${isPresent(summary.nearestDistanceKm) ? summary.nearestDistanceKm : "--"}km`, label: "最近任务" },
        { value: `${isPresent(summary.maxAreaMu) ? summary.maxAreaMu : "--"}亩`, label: "单次面积" },
        { value: `¥${isPresent(summary.maxExpectedIncome) ? summary.maxExpectedIncome : "--"}`, label: "预估收入" }
      ];
    },
    formatTask(task) {
      return {
        id: task.id || task.taskId,
        taskNo: task.taskNo,
        title: task.taskTitle || "未命名任务",
        detail: `${task.locationName || "未知地点"} · 距您 ${isPresent(task.distanceKm) ? task.distanceKm : "--"}km · ${isPresent(task.areaMu) ? task.areaMu : "--"} 亩`,
        price: `¥${isPresent(task.expectedIncome) ? task.expectedIncome : "--"}`,
        tags: this.resolveTags(task)
      };
    },
    resolveTags(task) {
      if (Array.isArray(task.tags) && task.tags.length) {
        return task.tags.filter(Boolean);
      }
      return [
        task.cropType,
        task.serviceType,
        isPresent(task.requiredBatteryCount) ? `需电池${task.requiredBatteryCount}组` : ""
      ].filter(Boolean);
    },
    handleAction() {
      if (this.isLoggedIn) {
        this.loadRecommendTasks();
        return;
      }
      common_vendor.index.showModal({
        title: "登录后接单",
        content: "飞手接单、资料维护和订单通知需要登录后使用。",
        cancelText: "稍后再说",
        confirmText: "去登录",
        success: (result) => {
          if (result.confirm) {
            common_vendor.index.navigateTo({
              url: "/pages/index/index"
            });
          }
        }
      });
    },
    handleViewTask(item) {
      if (!this.isLoggedIn) {
        this.handleAction();
        return;
      }
      if (!item.id) {
        return;
      }
      common_vendor.wx$1.showLoading({
        title: "加载中",
        mask: true
      });
      common_vendor.index.navigateTo({
        url: `/pages/task/detail?id=${item.id}`,
        fail: () => {
          common_vendor.wx$1.hideLoading();
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.isLoggedIn ? "已登录" : "未登录"),
    b: common_vendor.t($data.isLoggedIn ? "查看可接订单" : "登录后接单"),
    c: common_vendor.o((...args) => $options.handleAction && $options.handleAction(...args), "0b"),
    d: common_vendor.f($data.stats, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: item.label
      };
    }),
    e: common_vendor.o((...args) => $options.loadRecommendTasks && $options.loadRecommendTasks(...args), "92"),
    f: $data.tasksLoading
  }, $data.tasksLoading ? {} : !$data.items.length ? {} : {
    h: common_vendor.f($data.items, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.detail),
        c: item.tags.length
      }, item.tags.length ? {
        d: common_vendor.f(item.tags, (tag, k1, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        e: common_vendor.t(item.price),
        f: common_vendor.o(($event) => $options.handleViewTask(item), item.id || item.taskNo),
        g: item.id || item.taskNo,
        h: common_vendor.o(($event) => $options.handleViewTask(item), item.id || item.taskNo)
      });
    })
  }, {
    g: !$data.items.length
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-388b40d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/menu/menu.js.map
