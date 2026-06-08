const ENV = 'prod'

const config = {
  dev: {
    baseUrl: 'http://localhost:8080'
  },
  prod: {
    baseUrl: 'https://xyd-backend.up.railway.app'
  }
}

export default config[ENV]
