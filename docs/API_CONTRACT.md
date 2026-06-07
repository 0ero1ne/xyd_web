# XYD 前后端接口约定

## 1. 通用规则

Base URL:

```text
http://localhost:8080
```

前端请求 Base URL 由 `config/env.js` 统一配置：开发阶段使用 `ENV = 'dev'`，上线发行前改为 `ENV = 'prod'`。

统一响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

鉴权方式：

```http
Authorization: Bearer <token>
```

说明：

- 登录接口不需要 token。
- 其他小程序接口需要 token。
- userId 由后端从 token 解析，前端不要传 userId。
- 前端兼容 `{ code, message, data }` 和直接返回业务数据两种形式，但后端推荐统一 `{ code, message, data }`。

---

## 2. 登录接口

### 飞手微信登录

```http
POST /api/auth/wx-login
```

请求：

```json
{
  "code": "uni.login 返回的临时 code",
  "nickname": "微信昵称",
  "avatarUrl": "微信头像地址",
  "userIdentity": "pilot"
}
```

返回 `data`：

```json
{
  "token": "jwt-token",
  "userInfo": {
    "id": 1,
    "openid": "微信 openid",
    "nickname": "飞手昵称",
    "avatarUrl": "头像地址",
    "phone": "13800000000",
    "role": "USER",
    "status": 1,
    "userIdentity": "pilot"
  }
}
```

前端登录成功后保存：

```text
token
userInfo
planeUserRole = pilot
planeUserRoleName = 无人机飞手
```

### 退出登录

```http
POST /api/auth/logout
```

---

## 3. 用户资料接口

### 获取飞手资料

```http
GET /api/user/profile
```

返回 `data`：

```json
{
  "avatarUrl": "头像地址",
  "nickname": "飞手昵称",
  "realName": "真实姓名",
  "phone": "手机号",
  "userIdentity": "pilot"
}
```

### 更新飞手资料

```http
PUT /api/user/profile
```

请求：

```json
{
  "nickname": "飞手昵称",
  "avatarUrl": "头像地址",
  "realName": "真实姓名",
  "phone": "手机号",
  "userIdentity": "pilot"
}
```

---

## 4. 账号安全接口

### 获取账号安全信息

```http
GET /api/user/account
```

返回 `data`：

```json
{
  "phone": "13800000000",
  "maskedPhone": "138****0000",
  "wechatBound": true
}
```

前端兼容字段：

```text
isWechatBound
wechatBindStatus
bindStatus
```

### 绑定微信账号

```http
POST /api/user/account/bind-wechat
```

请求：

```json
{
  "code": "uni.login 返回的微信 code"
}
```

说明：

- 用于账号与安全页面绑定微信账号。
- 是把当前登录用户绑定到微信 openid。
- 不等同于重新登录。
- 当前用户由后端从 token 中解析。

---

## 5. 服务区域接口

### 查询服务区域

```http
GET /api/address/list
```

返回 `data`：

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

### 新增服务区域

```http
POST /api/address/create
```

### 更新服务区域

```http
PUT /api/address/update/{id}
```

### 设置默认服务区域

```http
POST /api/address/default/{id}
```

### 删除服务区域

```http
DELETE /api/address/delete/{id}
```

---

## 6. 任务接口

### 推荐任务

```http
GET /api/task/recommend
```

说明：

- 只返回 `agri_task.status = 1` 的待接单任务。
- 已接单、进行中、已完成、已取消任务不出现在推荐任务中。

返回 `data`：

```json
[
  {
    "id": 1,
    "taskNo": "TASK20260601001",
    "taskTitle": "水稻除虫喷洒",
    "locationName": "青禾村东侧 3 号田",
    "distanceKm": 2.3,
    "areaMu": 32,
    "expectedIncome": 960,
    "tags": ["今日可飞", "除虫", "需电池4组"],
    "status": 1,
    "statusLabel": "待接单"
  }
]
```

### 工作台统计

```http
GET /api/task/summary
```

返回 `data`：

```json
{
  "nearestDistanceKm": 2.3,
  "maxAreaMu": 45,
  "maxExpectedIncome": 1260
}
```

### 任务详情

```http
GET /api/task/detail/{id}
```

返回 `data`：
```json
{
  "id": 1,
  "taskNo": "TASK20260601001",
  "taskTitle": "水稻除虫喷洒",
  "status": 1,
  "statusLabel": "待接单",
  "expectedIncome": 960,
  "locationName": "青禾村东侧 3 号田",
  "detailAddress": "青禾村东侧 3 号田",
  "distanceKm": 2.3,
  "areaMu": 32,
  "cropType": "水稻",
  "serviceType": "除虫喷洒",
  "plannedStartTime": "2026-06-01T17:00:00",
  "plannedEndTime": "2026-06-01T19:00:00",
  "deadlineTime": "2026-06-01T16:30:00",
  "requiredBatteryCount": 4,
  "pesticideName": "阿维菌素",
  "pesticideDosage": "500ml/亩",
  "tags": ["今日可飞", "除虫", "需电池4组"],
  "description": "按田块边界均匀喷洒，避开鱼塘区域。",
  "contactName": "张三",
  "contactPhone": "13800000000"
}
```

---

## 7. 订单接口

### 接单

```http
POST /api/order/accept/{taskId}
```

说明：

- 后端从 token 解析当前用户。
- 接单成功后任务从大厅消失。
- 生成当前用户的订单。

### 我的订单

```http
GET /api/order/my?status=all&page=1&size=10
```

参数：

```text
all = 全部
running = 进行中，对应 order_status IN (1,2)
completed = 已完成，对应 order_status = 3
```

返回 `data`：

```json
{
  "records": [
    {
      "orderId": 1,
      "orderNo": "ORDER20260601001",
      "taskId": 1,
      "taskTitle": "水稻除虫喷洒",
      "locationName": "青禾村东侧 3 号田",
      "areaMu": 32,
      "distanceKm": 2.3,
      "actualIncome": 960,
      "expectedIncome": 960,
      "orderStatus": 2,
      "statusLabel": "进行中",
      "acceptedTime": "2026-06-01T16:30:00",
      "startTime": "2026-06-01T17:00:00",
      "completedTime": null
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### 完成订单

```http
POST /api/order/complete/{orderId}
```

说明：

- 只能完成当前登录用户自己的订单。
- 完成后 `order_status = 3`。
- 已完成订单计入累计收入。

### 取消订单

```http
POST /api/order/cancel/{orderId}
```

请求：

```json
{
  "cancelReason": "用户主动取消"
}
```

说明：

- 取消后 `order_status = 0`。
- 取消订单不计入累计收入。

### 收入统计

```http
GET /api/order/income/summary
```

返回 `data`：

```json
{
  "totalIncome": 2220,
  "completedOrderCount": 2
}
```

说明：

- 只统计当前用户 `order_status = 3` 的已完成订单。
- 已取消订单不计入收入。
