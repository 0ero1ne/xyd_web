const ENV = 'prod'

const config = {
  dev: {
    baseUrl: 'http://localhost:8080'
  },
  prod: {
    baseUrl: 'https://xydbackend-production.up.railway.app'
  }
}

export default config[ENV]
