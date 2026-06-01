import request from '../utils/request.js'

export function acceptTask(taskId) {
  return request({
    url: `/api/order/accept/${taskId}`,
    method: 'POST'
  })
}

export function getMyOrders(params) {
  return request({
    url: '/api/order/my',
    method: 'GET',
    data: params
  })
}

export function getOrderDetail(orderId) {
  return request({
    url: `/api/order/detail/${orderId}`,
    method: 'GET'
  })
}

export function startOrder(orderId) {
  return request({
    url: `/api/order/start/${orderId}`,
    method: 'POST'
  })
}

export function completeOrder(orderId) {
  return request({
    url: `/api/order/complete/${orderId}`,
    method: 'POST'
  })
}

export function getIncomeSummary() {
  return request({
    url: '/api/order/income/summary',
    method: 'GET'
  })
}

export function cancelOrder(orderId, cancelReason) {
  return request({
    url: `/api/order/cancel/${orderId}`,
    method: 'POST',
    data: {
      cancelReason
    }
  })
}
