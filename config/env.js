// 开发阶段使用：
// const ENV = 'dev'
// 上线发行前改为：
// const ENV = 'prod'
const ENV = 'dev'

const config = {
	dev: {
		baseUrl: 'http://localhost:8080'
	},
	prod: {
		baseUrl: 'https://你的正式后端域名'
	}
}

export default config[ENV]
