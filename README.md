# 云航植保飞手端

基于 uni-app 开发的微信小程序前端，当前版本只面向无人机飞手入住和登录，不再提供其他角色登录入口。飞手可通过微信头像、昵称和 `code` 完成登录，进入工作台后查看推荐任务、维护飞手资料、管理服务区域、查看订单示例和配置消息通知。

## 技术栈

- uni-app / Vue
- 微信小程序
- HBuilderX 或 VS Code
- 后端建议：Spring Boot、JWT、PostgreSQL、微信 code2Session

## 页面结构

```text
pages/index/index.vue              飞手微信登录页
pages/menu/menu.vue                飞手工作台
pages/orders/orders.vue            订单列表示例
pages/profile/profile.vue          我的
pages/profile/edit-profile.vue     飞手资料
pages/profile/addresses.vue        服务区域
pages/profile/notifications.vue    消息通知
pages/profile/security.vue         账号与安全
pages/profile/help.vue             帮助与客服
api/task.js                        任务接口封装
utils/request.js                   请求封装
```

## 请求配置

当前请求基础地址在 `utils/request.js`：

```js
const baseUrl = "http://localhost:8080";
```

所有通过 `utils/request.js` 发起的请求默认携带：

```http
Content-Type: application/json
Authorization: Bearer <token>
```

`Authorization` 仅在本地存在 `token` 时添加。后端返回 HTTP `401` 时，前端会清理 `token` 和 `userInfo`，并跳转登录页。

## 通用响应格式

登录接口当前按以下格式校验：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

其中登录接口的 `data` 必须包含 `token` 和 `userInfo`。其他接口代码兼容两种返回形式：

```json
{ "code": 200, "data": {} }
```

或直接返回业务数据：

```json
{}
```

## 后端接口清单

### 1. 飞手微信登录

- Method: `POST`
- Path: `/api/auth/wx-login`
- 鉴权: 不需要
- 调用页面: `pages/index/index.vue`

请求体：

```json
{
  "code": "微信 uni.login 返回的临时 code",
  "nickname": "微信昵称",
  "avatarUrl": "微信头像地址",
  "userIdentity": "pilot"
}
```

期望响应：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt-token",
    "userInfo": {
      "id": 1,
      "openid": "微信 openid",
      "nickname": "飞手昵称",
      "avatarUrl": "头像地址",
      "userIdentity": "pilot"
    }
  }
}
```

前端登录成功后写入：

- `token`
- `userInfo`
- `planeUserRole = pilot`
- `planeUserRoleName = 无人机飞手`

### 2. 获取飞手资料

- Method: `GET`
- Path: `/api/user/profile`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/edit-profile.vue`

期望响应 `data`：

```json
{
  "avatarUrl": "头像地址",
  "nickname": "飞手昵称",
  "realName": "真实姓名",
  "phone": "手机号",
  "userIdentity": "pilot"
}
```

### 3. 更新飞手资料

- Method: `PUT`
- Path: `/api/user/profile`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/edit-profile.vue`

请求体：

```json
{
  "nickname": "飞手昵称",
  "avatarUrl": "头像地址",
  "realName": "真实姓名",
  "phone": "手机号",
  "userIdentity": "pilot"
}
```

建议响应：

```json
{
  "code": 200,
  "message": "资料已保存",
  "data": null
}
```

### 4. 获取账号安全信息

- Method: `GET`
- Path: `/api/user/account`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/security.vue`

期望响应 `data`：

```json
{
  "phone": "13800000000",
  "maskedPhone": "138****0000",
  "wechatBound": true
}
```

前端也兼容字段：

- `isWechatBound`
- `wechatBindStatus = 已绑定`
- `bindStatus = 已绑定`

### 5. 查询服务区域列表

- Method: `GET`
- Path: `/api/address/list`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/addresses.vue`

期望响应 `data`：

```json
[
  {
    "id": 1,
    "addressName": "东侧水稻田",
    "province": "浙江省",
    "city": "杭州市",
    "district": "萧山区",
    "detailAddress": "青禾村 3 号田",
    "contactName": "张三",
    "contactPhone": "13800000000",
    "longitude": 120.1,
    "latitude": 30.2,
    "isDefault": true
  }
]
```

### 6. 新增服务区域

- Method: `POST`
- Path: `/api/address/create`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/addresses.vue`

请求体：

```json
{
  "contactName": "张三",
  "contactPhone": "13800000000",
  "addressName": "东侧水稻田",
  "province": "浙江省",
  "city": "杭州市",
  "district": "萧山区",
  "detailAddress": "青禾村 3 号田",
  "longitude": null,
  "latitude": null,
  "isDefault": true
}
```

### 7. 更新服务区域

- Method: `PUT`
- Path: `/api/address/update/{id}`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/addresses.vue`

请求体同新增服务区域。

### 8. 设置默认服务区域

- Method: `POST`
- Path: `/api/address/default/{id}`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/addresses.vue`

建议响应：

```json
{
  "code": 200,
  "message": "默认服务区域已更新",
  "data": null
}
```

### 9. 删除服务区域

- Method: `DELETE`
- Path: `/api/address/delete/{id}`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/profile/addresses.vue`

建议响应：

```json
{
  "code": 200,
  "message": "服务区域已删除",
  "data": null
}
```

### 10. 获取飞手工作台统计

- Method: `GET`
- Path: `/api/task/summary`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/menu/menu.vue`
- 前端封装: `api/task.js` 的 `getTaskSummary()`

期望响应 `data`：

```json
{
  "nearestDistanceKm": 2.3,
  "maxAreaMu": 32,
  "maxExpectedIncome": 960
}
```

页面展示：

- `nearestDistanceKm + km`，下方文字“最近任务”
- `maxAreaMu + 亩`，下方文字“单次面积”
- `¥maxExpectedIncome`，下方文字“预估收入”

字段为空时分别显示 `--km`、`--亩`、`¥--`。

### 11. 获取推荐任务

- Method: `GET`
- Path: `/api/task/recommend`
- 鉴权: 需要 `Authorization`
- 调用页面: `pages/menu/menu.vue`
- 前端封装: `api/task.js` 的 `getRecommendTasks()`

期望响应 `data`：

```json
[
  {
    "id": 1,
    "taskNo": "TASK20260601001",
    "taskTitle": "水稻除虫喷洒",
    "cropType": "水稻",
    "serviceType": "除虫喷洒",
    "locationName": "青禾村东侧 3 号田",
    "distanceKm": 2.3,
    "areaMu": 32,
    "expectedIncome": 960,
    "plannedStartTime": "2026-06-01T16:00:00",
    "requiredBatteryCount": 4,
    "tags": ["今日可飞", "除虫", "需电池4组"],
    "status": 1,
    "statusLabel": "可接单"
  }
]
```

页面展示规则：

- 标题：`taskTitle`
- 右侧价格：`¥expectedIncome`
- 基础信息：`locationName · 距您 distanceKm km · areaMu 亩`
- 标签：优先展示后端 `tags`
- `tags` 为空时，前端使用 `cropType`、`serviceType`、`requiredBatteryCount` 生成备用标签
- `distanceKm` 为空显示 `--km`
- `areaMu` 为空显示 `--亩`
- `expectedIncome` 为空显示 `¥--`
- 推荐任务为空时显示“暂无推荐任务”
- 接口失败时显示 `任务加载失败`

## 本地缓存字段

| Key                         | 说明                                                |
| --------------------------- | --------------------------------------------------- |
| `token`                     | 后端 JWT，作为 `Authorization: Bearer <token>` 使用 |
| `userInfo`                  | 登录返回的飞手基础信息                              |
| `planeUserRole`             | 固定为 `pilot`                                      |
| `planeUserRoleName`         | 固定为 `无人机飞手`                                 |
| `planeProfileDetails`       | 本地缓存的真实姓名和电话                            |
| `planeServiceAddresses`     | 服务区域列表缓存                                    |
| `addressList`               | 兼容旧字段的服务区域列表缓存                        |
| `planeNotificationSettings` | 消息通知开关                                        |
| `planeFeedbackList`         | 本地反馈记录                                        |

## 后端对接注意事项

1. 登录接口必须使用微信 `code2Session` 换取 `openid/session_key`，再签发 JWT。
2. 当前小程序只发送 `userIdentity: "pilot"`，后端可直接按飞手账号创建或更新用户。
3. 需要登录的接口请校验 `Authorization`，过期时返回 HTTP `401`。
4. 建议所有接口保持 `{ code, message, data }` 结构，便于前端统一处理。
5. 服务区域接口沿用 `/api/address/*` 路径，但业务含义已调整为飞手常驻服务区域。
6. 工作台推荐任务与统计接口位于 `/api/task/*`，当前前端只读取列表和摘要，不提交接单动作。

## 订单接口对接

订单相关接口封装在 `api/order.js`，请求会通过 `utils/request.js` 自动携带当前登录 token：

- `POST /api/order/accept/{taskId}`：接单
- `GET /api/order/my`：我的订单列表
- `GET /api/order/detail/{orderId}`：订单详情
- `POST /api/order/start/{orderId}`：开始作业
- `POST /api/order/complete/{orderId}`：完成作业
- `POST /api/order/cancel/{orderId}`：取消订单
- `GET /api/order/income/summary`：当前飞手收入统计

订单页 `pages/orders/orders.vue` 根据当前登录 token 查询个人订单，不从前端传递 `userId`，用户身份由后端从 `Authorization: Bearer <token>` 中解析。

订单页 tab 与接口参数关系：

- 全部：`status=all`
- 进行中：`status=running`
- 已完成：`status=completed`

订单列表默认请求参数：

```js
{
  status: 'all',
  page: 1,
  size: 10
}
```

订单页进行中订单支持完成操作：

- 当 `orderStatus === 1` 或 `orderStatus === 2` 时显示“完成”按钮
- 点击后调用 `POST /api/order/complete/{orderId}`
- 完成成功后刷新当前订单列表

订单页进行中订单支持取消操作：

- 当 `orderStatus === 1` 或 `orderStatus === 2` 时显示“取消”按钮
- 点击后确认取消，前端以 `用户主动取消` 作为 `cancelReason`
- 确认后调用 `POST /api/order/cancel/{orderId}`
- 取消成功后刷新当前订单列表
- 已取消订单状态为 `orderStatus === 0`，状态标签显示“已取消”；收入统计由后端接口只统计已完成订单，前端不做过滤

我的页面 `pages/profile/profile.vue` 会调用 `GET /api/order/income/summary` 展示当前飞手累计收入：

```json
{
  "totalIncome": 2220,
  "completedOrderCount": 2
}
```
