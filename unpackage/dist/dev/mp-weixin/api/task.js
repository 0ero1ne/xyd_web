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
exports.getRecommendTasks = getRecommendTasks;
exports.getTaskSummary = getTaskSummary;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/task.js.map
