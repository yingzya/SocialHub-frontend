<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>欢迎登录</h2>
        <p>请输入您的账号信息</p>
      </div>

      <div class="login-form">
        <div class="input-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            :class="{ 'input-error': error }"
            @keyup.enter="loginUser"
          />
          <i class="icon-user">👤</i>
        </div>

        <div class="input-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :class="{ 'input-error': error }"
            @keyup.enter="loginUser"
          />
          <i class="icon-lock">🔒</i>
        </div>

        <button
          class="login-btn"
          :disabled="loading"
          @click="loginUser"
        >
          <span v-if="!loading">登录</span>
          <span v-else class="loading">登录中...</span>
        </button>

        <div v-if="message" class="message" :class="{ 'message-success': isSuccess, 'message-error': !isSuccess }">
          {{ message }}
        </div>

        <div class="login-links">
          <a href="#" class="link">忘记密码?</a>
          <span>|</span>
          <router-link to="/register" class="link">注册账号</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../services/api.js'
import { useUserStore } from '../stores/user.js'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const message = ref('')
const error = ref(false)
const loading = ref(false)

const isSuccess = computed(() => message.value.includes('成功'))

const loginUser = async () => {
  if (!username.value || !password.value) {
    message.value = '请输入用户名和密码'
    error.value = true
    return
  }

  loading.value = true
  error.value = false
  message.value = ''

  try {
    const res = await auth.login(username.value, password.value)
    if (res.data.success) {
      // 使用 Pinia 存 token 并设置用户信息
      userStore.setUser({
        token: res.data.token,
        username: res.data.username,
        avatar: res.data.avatar
      })
      message.value = '登录成功，正在跳转...'
      setTimeout(() => router.push('/'), 1000)
    } else {
      message.value = res.data.message || '登录失败'
      error.value = true
    }
  } catch (err) {
    console.error('登录错误:', err)
    message.value = err.response?.data?.message || '网络错误，请稍后重试'
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group input.input-error {
  border-color: #ff4757;
}

.input-group .icon-user,
.input-group .icon-lock {
  position: absolute;
  left: 12px;
  top: 38px;
  font-size: 18px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading {
  display: inline-block;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
  font-size: 14px;
}

.message-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.login-links {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-links .link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  margin: 0 8px;
  transition: color 0.3s ease;
}

.login-links .link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 0 10px;
  }

  .login-header h2 {
    font-size: 24px;
  }
}
</style>



