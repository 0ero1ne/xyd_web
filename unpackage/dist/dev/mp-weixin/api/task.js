"use strict";
const utils_request = require("../utils/request.js");
function getRecommendTasks() {
  return utils_request.request({
    url: "/api/task/recommend",
    method: "GET"
  });
}
function getTaskSummary() {
  return utils_request.request({
    url: "/api/task/summary",
    method: "GET"
  });
}
function getTaskDetail(id) {
  return utils_request.request({
    url: `/api/task/detail/${id}`,
    method: "GET"
  });
}
exports.getRecommendTasks = getRecommendTasks;
exports.getTaskDetail = getTaskDetail;
exports.getTaskSummary = getTaskSummary;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/task.js.map
