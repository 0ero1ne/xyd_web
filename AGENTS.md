# plane 前端 AI 开发规则

本项目是云航植保飞手端微信小程序，技术栈为 uni-app / Vue。

## 固定规则

- 不修改 `unpackage/dist/dev/mp-weixin` 编译产物目录。
- 不随意重构无关页面。
- 不随意修改登录逻辑。
- 不随意修改 `utils/request.js` 的 token 机制。
- 接口约定以 `docs/API_CONTRACT.md` 为准。
- 请求统一通过 `utils/request.js`。
- token 使用 `Authorization: Bearer <token>`。
- 后端返回 HTTP 401 时，清除本地 token 和 userInfo，并跳转登录页。
- userId 不从前端传递，用户身份由后端通过 token 解析。
- 小程序端角色固定为飞手：`pilot`。
- 本地缓存中 `planeUserRole = pilot`，`planeUserRoleName = 无人机飞手`。
- 后续新增接口时，只更新 `docs/API_CONTRACT.md`，不要频繁更新 README.md。
- 只做增量修改，不输出完整无关文件。

## 页面说明

```text
pages/index/index.vue              登录页
pages/menu/menu.vue                工作台 / 推荐任务
pages/orders/orders.vue            我的订单
pages/profile/profile.vue          我的
pages/profile/edit-profile.vue     飞手资料
pages/profile/addresses.vue        服务区域
pages/profile/security.vue         账号与安全
```

## 常见修改范围

登录相关：

```text
pages/index/index.vue
api/auth.js
utils/request.js
```

任务相关：

```text
pages/menu/menu.vue
api/task.js
```

订单相关：

```text
pages/orders/orders.vue
api/order.js
```

账号安全相关：

```text
pages/profile/security.vue
api/user.js
```

服务区域相关：

```text
pages/profile/addresses.vue
api/address.js
```
