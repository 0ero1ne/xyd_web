# plane 前端 AI 开发规则

本项目是云航植保飞手端 Web 前端，技术栈为 Vue3 / Vite / Vue Router / Axios / Pinia。

## 固定规则

- 这是 Web 项目，不再使用 wx、uni 或小程序原生 API。
- 不修改 `unpackage/dist/dev/mp-weixin` 历史编译产物目录。
- 不保留或新增 `pages.json` 小程序配置逻辑。
- 不随意重构无关页面。
- 接口约定以 `docs/API_CONTRACT.md` 为准。
- 请求统一通过 `src/utils/request.js`。
- 环境配置统一维护在 `src/config/env.js`。
- token 使用 `Authorization: Bearer <token>`。
- token 和 userInfo 使用 Web 标准 `localStorage`。
- 后端返回 HTTP 401 时，清除本地 token 和 userInfo，并跳转 `/login`。
- userId 不从前端传递，用户身份由后端通过 token 解析。
- 飞手端角色固定为 `pilot`，但 Web 登录注册接口不额外传 userId。
- 后续新增接口时，只更新 `docs/API_CONTRACT.md`，不要频繁更新 README.md。
- 只做增量修改，不输出完整无关文件。

## 页面说明

```text
src/views/Login.vue        登录页
src/views/Register.vue     注册页
src/views/Tasks.vue        任务大厅
src/views/TaskDetail.vue   任务详情
src/views/Orders.vue       我的订单
src/views/Profile.vue      我的页面
```

## 常见修改范围

登录注册相关：

```text
src/views/Login.vue
src/views/Register.vue
src/api/auth.js
src/stores/auth.js
src/utils/request.js
```

任务相关：

```text
src/views/Tasks.vue
src/views/TaskDetail.vue
src/api/task.js
```

订单与收入相关：

```text
src/views/Orders.vue
src/views/Profile.vue
src/api/order.js
```
