import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true
});

// 自动携带 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response && error.response.status === 403) {
    alert('未授权，请先登录');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

const auth = {
  login(username, password) {
    return api.post('/auth/login', { username, password });
  },
  register(username, password) {
    return api.post('/auth/register', { username, password });
  },
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export { api, auth };
