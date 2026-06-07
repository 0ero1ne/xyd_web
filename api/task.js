import request from '../utils/request.js'

export function getRecommendTasks() {
	return request({
		url: '/api/task/recommend',
		method: 'GET'
	})
}

export function getTaskSummary() {
	return request({
		url: '/api/task/summary',
		method: 'GET'
	})
}

export function getTaskDetail(id) {
	return request({
		url: `/api/task/detail/${id}`,
		method: 'GET'
	})
}
