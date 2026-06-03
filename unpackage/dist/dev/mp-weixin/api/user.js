"use strict";
const utils_request = require("../utils/request.js");
function getAccountInfo() {
  return utils_request.request({
    url: "/api/user/account",
    method: "GET"
  });
}
function bindWechatAccount(code) {
  return utils_request.request({
    url: "/api/user/account/bind-wechat",
    method: "POST",
    data: {
      code
    }
  });
}
exports.bindWechatAccount = bindWechatAccount;
exports.getAccountInfo = getAccountInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
