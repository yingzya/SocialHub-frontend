<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <h1>🌟 社交广场</h1>
      </div>
      
      <!-- 连接状态指示器 -->
      <div class="connection-status" @click="checkConnection" :title="getConnectionTitle()">
        <span class="status-indicator" :class="connectionStatus"></span>
        <span class="status-text">{{ getConnectionText() }}</span>
      </div>
      
      <nav class="nav">
        <router-link v-if="userStore.loggedIn" to="/" class="nav-link">首页</router-link>
      </nav>
      
      <div class="user-section">
        <div v-if="userStore.loggedIn" class="user-info">
          <img :src="userStore.user?.avatar || userStore.avatar" :alt="userStore.user?.username || userStore.username" class="avatar" />
          <div class="user-dropdown">
            <button class="user-button" @click="toggleDropdown">
              <span class="username">{{ userStore.user?.username || userStore.username }}</span>
              <span class="dropdown-arrow" :class="{ 'rotated': dropdownOpen }">▼</span>
            </button>
            <div v-if="dropdownOpen" class="dropdown-menu" @click="closeDropdown">
              <a href="#" class="dropdown-item">个人资料</a>
              <router-link to="/settings" class="dropdown-item">⚙️ 用户设置</router-link>
              <hr class="dropdown-divider">
              <router-link to="/debug" class="dropdown-item">🔧 系统诊断</router-link>
              <a href="#" class="dropdown-item" @click="checkConnection">测试连接</a>
              <hr class="dropdown-divider">
              <a href="#" class="dropdown-item logout" @click="logout">退出登录</a>
            </div>
          </div>
        </div>
        <div v-else class="auth-links">
          <router-link to="/login" class="auth-link">登录</router-link>
          <router-link to="/register" class="auth-link register-btn">注册</router-link>
        </div>
      </div>
  </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user.js'
import { testConnection } from '../services/api.js'

const userStore = useUserStore()
const dropdownOpen = ref(false)
const connectionStatus = ref('unknown') // 'success', 'failed', 'unknown'

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const logout = () => {
  userStore.logout()
  closeDropdown()
}

// 测试后端连接
const checkConnection = async () => {
  try {
    connectionStatus.value = 'testing'
    const isConnected = await testConnection()
    connectionStatus.value = isConnected ? 'success' : 'failed'
  } catch (error) {
    connectionStatus.value = 'failed'
  }
}

// 获取连接状态文本
const getConnectionText = () => {
  switch (connectionStatus.value) {
    case 'success':
      return '连接成功'
    case 'failed':
      return '连接失败'
    case 'testing':
      return '测试中...'
    default:
      return '未知状态'
  }
}

// 获取连接状态提示
const getConnectionTitle = () => {
  switch (connectionStatus.value) {
    case 'success':
      return '后端连接正常，点击重新测试'
    case 'failed':
      return '后端连接失败，点击重新测试'
    case 'testing':
      return '正在测试连接...'
    default:
      return '点击测试后端连接'
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-dropdown')) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 获取用户信息
  if (userStore.loggedIn) {
    userStore.fetchUser()
  }
  // 自动检测后端连接
  checkConnection()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.connection-status:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.success {
  background-color: #28a745;
  box-shadow: 0 0 6px rgba(40, 167, 69, 0.5);
}

.status-indicator.failed {
  background-color: #dc3545;
  box-shadow: 0 0 6px rgba(220, 53, 69, 0.5);
}

.status-indicator.testing {
  background-color: #ffc107;
  animation: pulse-testing 1.5s infinite;
}

.status-indicator.unknown {
  background-color: #6c757d;
}

@keyframes pulse-testing {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.status-text {
  color: white;
  font-weight: 500;
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
}

.user-dropdown {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.username {
  font-weight: 500;
  font-size: 14px;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  padding: 8px 0;
  margin-top: 8px;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.logout {
  color: #e74c3c;
}

.dropdown-item.logout:hover {
  background: #fee;
}

.dropdown-divider {
  border: none;
  height: 1px;
  background: #eee;
  margin: 8px 0;
}

.auth-links {
  display: flex;
  gap: 12px;
  align-items: center;
}

.auth-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
}

.auth-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.register-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.register-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 56px;
  }
  
  .logo h1 {
    font-size: 20px;
  }
  
  .nav {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .dropdown-menu {
    right: -20px;
  }
}
</style>
