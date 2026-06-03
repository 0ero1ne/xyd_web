import request from '../utils/request.js'

export function getAccountInfo() {
	return request({
		url: '/api/user/account',
		method: 'GET'
	})
}

export function bindWechatAccount(code) {
	return request({
		url: '/api/user/account/bind-wechat',
		method: 'POST',
		data: {
			code
		}
	})
}
