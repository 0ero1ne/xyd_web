"use strict";
const ENV = "dev";
const config = {
  dev: {
    baseUrl: "http://localhost:8080"
  },
  prod: {
    baseUrl: "https://你的正式后端域名"
  }
};
const env = config[ENV];
exports.env = env;
//# sourceMappingURL=../../.sourcemap/mp-weixin/config/env.js.map
