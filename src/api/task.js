import request from '../utils/request'

export function getRecommendTasks() {
  return request.get('/api/task/recommend')
}

export function getTaskDetail(id) {
  return request.get(`/api/task/detail/${id}`)
}
