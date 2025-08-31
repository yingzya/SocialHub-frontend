import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/',
  withCredentials: false
});

// 请求拦截器：自动带上 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
}, error => Promise.reject(error));

// 响应拦截器
api.interceptors.response.use(res => res, error => {
  if (error.response && error.response.status === 403) {
    alert('未授权，请先登录');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

const auth = {
  async login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) localStorage.setItem('token', res.data.token);
    return res;
  },
  async register(username, password) {
    const res = await api.post('/auth/register', { username, password });
    if (res.data.success) localStorage.setItem('token', res.data.token);
    return res;
  },
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export { api, auth };
