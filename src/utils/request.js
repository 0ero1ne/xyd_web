import axios from 'axios'
import env from '../config/env'
import router from '../router'

const request = axios.create({
  baseURL: env.baseUrl,
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data

    if (payload && typeof payload === 'object' && 'code' in payload) {
      if (payload.code === 200) {
        return payload.data
      }

      return Promise.reject(new Error(payload.message || '请求失败'))
    }

    return payload
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.replace('/login')
    }

    const message = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default request
