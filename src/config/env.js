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
