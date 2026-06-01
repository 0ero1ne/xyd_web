"use strict";
const utils_request = require("../utils/request.js");
function acceptTask(taskId) {
  return utils_request.request({
    url: `/api/order/accept/${taskId}`,
    method: "POST"
  });
}
function getMyOrders(params) {
  return utils_request.request({
    url: "/api/order/my",
    method: "GET",
    data: params
  });
}
function completeOrder(orderId) {
  return utils_request.request({
    url: `/api/order/complete/${orderId}`,
    method: "POST"
  });
}
function getIncomeSummary() {
  return utils_request.request({
    url: "/api/order/income/summary",
    method: "GET"
  });
}
exports.acceptTask = acceptTask;
exports.completeOrder = completeOrder;
exports.getIncomeSummary = getIncomeSummary;
exports.getMyOrders = getMyOrders;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
