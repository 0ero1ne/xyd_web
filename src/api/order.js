import request from '../utils/request'

export function acceptTask(taskId) {
  return request.post(`/api/order/accept/${taskId}`)
}

export function getMyOrders(params) {
  return request.get('/api/order/my', { params })
}

export function completeOrder(orderId) {
  return request.post(`/api/order/complete/${orderId}`)
}

export function cancelOrder(orderId, cancelReason = '用户主动取消') {
  return request.post(`/api/order/cancel/${orderId}`, { cancelReason })
}

export function getIncomeSummary() {
  return request.get('/api/order/income/summary')
}
