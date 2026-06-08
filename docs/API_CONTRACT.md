# 云航植保飞手 Web 前后端接口约定

## 1. 通用规则

Base URL:

```text
https://xyd-backend.up.railway.app
```

前端请求 Base URL 由 `src/config/env.js` 统一配置：开发阶段使用 `ENV = 'dev'`，上线发布前改为 `ENV = 'prod'`。

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
- 登录和注册接口不需要 token。
- 其他业务接口需要 token。
- token 存储在 Web 标准 `localStorage`。
- userId 由后端从 token 解析，前端不要传 userId。
- 后端返回 HTTP 401 时，前端清除 token 和 userInfo，并跳转 `/login`。

---

## 2. Web 登录注册接口

### 注册

```http
POST /api/web/auth/register
```

请求：

```json
{
  "username": "张三",
  "phone": "13800000000",
  "password": "123456"
}
```

返回 `data`：

```json
{
  "token": "jwt-token",
  "userInfo": {
    "id": 1,
    "username": "张三",
    "phone": "13800000000",
    "role": "pilot"
  }
}
```

### 登录

```http
POST /api/web/auth/login
```

请求：

```json
{
  "account": "张三或13800000000",
  "password": "123456"
}
```

返回 `data`：

```json
{
  "token": "jwt-token",
  "userInfo": {
    "id": 1,
    "username": "张三",
    "phone": "13800000000",
    "role": "pilot"
  }
}
```

前端登录或注册成功后保存：

```text
token
userInfo
```

---

## 3. 任务接口

### 推荐任务

```http
GET /api/task/recommend
```

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

说明：
- 只返回 `agri_task.status = 1` 的待接单任务。
- 已接单、进行中、已完成、已取消任务不出现在推荐任务中。

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

## 4. 订单接口

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
