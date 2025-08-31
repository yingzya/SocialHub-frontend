<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>注册账号</h2>
        <p>加入我们的社交广场</p>
      </div>

      <div class="register-form">
        <div class="input-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            :class="{ 'input-error': error }"
            @keyup.enter="registerUser"
          />
          <i class="icon-user">👤</i>
        </div>

        <div class="input-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="请输入邮箱地址"
            :class="{ 'input-error': error }"
            @keyup.enter="registerUser"
          />
          <i class="icon-email">📧</i>
        </div>

        <div class="input-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :class="{ 'input-error': error }"
            @keyup.enter="registerUser"
          />
          <i class="icon-lock">🔒</i>
        </div>

        <div class="input-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :class="{ 'input-error': error }"
            @keyup.enter="registerUser"
          />
          <i class="icon-lock">🔒</i>
        </div>

        <button
          class="register-btn"
          :disabled="loading"
          @click="registerUser"
        >
          <span v-if="!loading">注册</span>
          <span v-else class="loading">注册中...</span>
        </button>

        <div v-if="message" class="message" :class="{ 'message-success': isSuccess, 'message-error': !isSuccess }">
          {{ message }}
        </div>

        <div class="register-links">
          <span>已有账号？</span>
          <router-link to="/login" class="link">立即登录</router-link>
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
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref(false)
const loading = ref(false)

const isSuccess = computed(() => message.value.includes('成功'))

const validateForm = () => {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    message.value = '请填写所有字段'
    return false
  }
  
  if (username.value.length < 3) {
    message.value = '用户名至少3个字符'
    return false
  }
  
  if (password.value.length < 6) {
    message.value = '密码至少6个字符'
    return false
  }
  
  if (password.value !== confirmPassword.value) {
    message.value = '两次输入的密码不一致'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    message.value = '请输入有效的邮箱地址'
    return false
  }
  
  return true
}

const registerUser = async () => {
  error.value = false
  message.value = ''
  
  if (!validateForm()) {
    error.value = true
    return
  }

  loading.value = true

  try {
    const res = await auth.register(username.value, password.value, email.value)
    if (res.data.success) {
      userStore.setUser({
        token: res.data.token,
        username: res.data.username,
        avatar: res.data.avatar
      })
              message.value = '注册成功，正在跳转...'
        setTimeout(() => router.push('/'), 1000)
    } else {
      message.value = res.data.message || '注册失败'
      error.value = true
    }
  } catch (err) {
    console.error('注册错误:', err)
    message.value = err.response?.data?.message || '网络错误，请稍后重试'
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.register-header p {
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
.input-group .icon-email,
.input-group .icon-lock {
  position: absolute;
  left: 12px;
  top: 38px;
  font-size: 18px;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
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

.register-links {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-links .link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  margin-left: 8px;
  transition: color 0.3s ease;
}

.register-links .link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
    margin: 0 10px;
  }

  .register-header h2 {
    font-size: 24px;
  }
}
</style>
