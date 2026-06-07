"use strict";
const common_vendor = require("../common/vendor.js");
const config_env = require("../config/env.js");
const baseUrl = config_env.env.baseUrl;
let isRedirectingToLogin = false;
function redirectToLogin() {
  if (isRedirectingToLogin) {
    return;
  }
  isRedirectingToLogin = true;
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.removeStorageSync("userInfo");
  common_vendor.index.showToast({
    title: "登录已过期，请重新登录",
    icon: "none"
  });
  setTimeout(() => {
    common_vendor.index.reLaunch({
      url: "/pages/index/index",
      complete: () => {
        isRedirectingToLogin = false;
      }
    });
  }, 1200);
}
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
        if (response.statusCode === 401) {
          redirectToLogin();
          reject(new Error("登录已过期，请重新登录"));
          return;
        }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }
        common_vendor.index.showToast({
          title: "无法连接后端服务",
          icon: "none"
        });
        reject(new Error(response.data && response.data.message ? response.data.message : "请求失败"));
      },
      fail: () => {
        common_vendor.index.showToast({
          title: "无法连接后端服务",
          icon: "none"
        });
        reject(new Error("无法连接后端服务"));
      }
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
