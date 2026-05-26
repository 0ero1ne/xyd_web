const baseUrl = 'http://localhost:8080'

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
				if (response.statusCode >= 200 && response.statusCode < 300) {
					resolve(response.data)
					return
				}

				reject(new Error(response.data && response.data.message ? response.data.message : '请求失败'))
			},
			fail: reject
		})
	})
}

export { baseUrl }
export default request
