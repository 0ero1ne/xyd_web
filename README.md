# 云航植保飞手端

基于 uni-app 开发的微信小程序前端，面向无人机飞手使用。飞手可通过微信登录进入工作台，查看推荐任务、接单、查看订单、维护个人资料、管理服务区域和账号安全信息。

## 技术栈

- uni-app / Vue
- 微信小程序
- HBuilderX / VS Code
- 后端：Spring Boot + PostgreSQL + MyBatis + JWT

## 主要目录

```text
pages/index/index.vue              飞手微信登录页
pages/menu/menu.vue                飞手工作台 / 推荐任务
pages/orders/orders.vue            我的订单
pages/profile/profile.vue          我的
pages/profile/edit-profile.vue     飞手资料
pages/profile/addresses.vue        服务区域
pages/profile/notifications.vue    消息通知
pages/profile/security.vue         账号与安全
pages/profile/help.vue             帮助与客服

api/task.js                        任务接口
api/order.js                       订单接口
api/user.js                        用户接口
utils/request.js                   请求封装
```

## 请求配置

请求基础地址在：

```js
utils / request.js;
```

当前后端地址：

```js
const baseUrl = "http://localhost:8080";
```

请求默认携带：

```http
Content-Type: application/json
Authorization: Bearer <token>
```

HTTP 401 时，前端会清理本地 `token` 和 `userInfo`，并跳转登录页。

## 本地缓存字段

| Key                         | 说明                     |
| --------------------------- | ------------------------ |
| `token`                     | 后端 JWT                 |
| `userInfo`                  | 登录返回的飞手信息       |
| `planeUserRole`             | 固定为 `pilot`           |
| `planeUserRoleName`         | 固定为 `无人机飞手`      |
| `planeProfileDetails`       | 本地飞手资料缓存         |
| `planeServiceAddresses`     | 服务区域缓存             |
| `addressList`               | 兼容旧字段的服务区域缓存 |
| `planeNotificationSettings` | 消息通知设置             |
| `planeFeedbackList`         | 本地反馈记录             |

## 开发说明

AI 开发规则见：

```text
AGENTS.md
```

前后端接口约定见：

```text
docs/API_CONTRACT.md
```

以后接口变更优先更新 `docs/API_CONTRACT.md`，不要把大量接口说明继续堆在 README.md。
