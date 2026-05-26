"use strict";
const common_vendor = require("../common/vendor.js");
const baseUrl = "http://localhost:8080";
function request(options = {}) {
  const token = common_vendor.index.getStorageSync("token");
  const header = {
    "Content-Type": "application/json",
    ...options.header || {}
  };
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      url: `${baseUrl}${options.url}`,
      header,
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }
        reject(new Error(response.data && response.data.message ? response.data.message : "请求失败"));
      },
      fail: reject
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
