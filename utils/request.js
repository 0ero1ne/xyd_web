import env from '@/config/env.js'

const baseUrl = env.baseUrl
let isRedirectingToLogin = false

function redirectToLogin() {
	if (isRedirectingToLogin) {
		return
	}
	isRedirectingToLogin = true
	uni.removeStorageSync('token')
	uni.removeStorageSync('userInfo')
	uni.showToast({
		title: '登录已过期，请重新登录',
		icon: 'none'
	})
	setTimeout(() => {
		uni.reLaunch({
			url: '/pages/index/index',
			complete: () => {
				isRedirectingToLogin = false
			}
		})
	}, 1200)
}

function request(options = {}) {
	const token = uni.getStorageSync('token')
	const header = {
		'Content-Type': 'application/json',
		...(options.header || {})
	}

	if (token) {
		header.Authorization = `Bearer ${token}`
	}

	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			url: `${baseUrl}${options.url}`,
			header,
			success: (response) => {
				if (response.statusCode === 401) {
					redirectToLogin()
					reject(new Error('登录已过期，请重新登录'))
					return
				}
				if (response.statusCode >= 200 && response.statusCode < 300) {
					resolve(response.data)
					return
				}

				uni.showToast({
					title: '无法连接后端服务',
					icon: 'none'
				})
				reject(new Error(response.data && response.data.message ? response.data.message : '请求失败'))
			},
			fail: () => {
				uni.showToast({
					title: '无法连接后端服务',
					icon: 'none'
				})
				reject(new Error('无法连接后端服务'))
			}
		})
	})
}

export { baseUrl }
export default request
