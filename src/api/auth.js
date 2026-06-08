import request from '../utils/request'

export function login(data) {
  return request.post('/api/web/auth/login', data)
}

export function register(data) {
  return request.post('/api/web/auth/register', data)
}
