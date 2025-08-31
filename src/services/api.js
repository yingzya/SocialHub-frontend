import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器：自动带上 token
api.interceptors.request.use(config => {
  console.log('发送请求:', config.method?.toUpperCase(), config.url);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
}, error => {
  console.error('请求错误:', error);
  return Promise.reject(error);
});

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.config.url);
    return response;
  }, 
  error => {
    console.error('响应错误:', error);
    
    if (error.code === 'ECONNABORTED') {
      alert('请求超时，请检查网络连接或后端服务是否启动');
      return Promise.reject(error);
    }
    
    if (error.response) {
      // 服务器返回了错误状态码
      if (error.response.status === 403) {
        alert('未授权，请先登录');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status === 404) {
        alert('请求的资源不存在');
      } else if (error.response.status >= 500) {
        alert('服务器错误，请稍后重试');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应（通常是网络错误或CORS错误）
      console.error('网络错误或CORS错误:', error.request);
      alert('网络连接失败，请检查：\n1. 后端服务是否启动（http://localhost:8080）\n2. 网络连接是否正常');
    }
    
    return Promise.reject(error);
  }
);

// 测试连接函数
const testConnection = async () => {
  try {
    const response = await api.get('/test/hello');
    console.log('后端连接测试成功:', response.data);
    return true;
  } catch (error) {
    console.error('后端连接测试失败:', error);
    return false;
  }
};

const auth = {
  async login(username, password) {
    try {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) localStorage.setItem('token', res.data.token);
    return res;
    } catch (error) {
      console.error('登录请求失败:', error);
      throw error;
    }
  },
  async register(username, password, email) {
    try {
      const res = await api.post('/auth/register', { username, password, email });
    if (res.data.success) localStorage.setItem('token', res.data.token);
    return res;
    } catch (error) {
      console.error('注册请求失败:', error);
      throw error;
    }
  },
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export { api, auth, testConnection };
