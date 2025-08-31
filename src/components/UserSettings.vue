<template>
  <div class="user-settings">
    <div class="settings-container">
      <h2>用户设置</h2>
      
      <!-- 头像设置 -->
      <div class="setting-section">
        <h3>头像设置</h3>
        <div class="avatar-setting">
          <div class="current-avatar">
            <UserAvatar :src="userStore.user?.avatar" :size="80" />
            <p>当前头像</p>
          </div>
          
          <div class="avatar-upload">
            <ImageUpload 
              v-model="newAvatar" 
              placeholder="上传新头像"
              :maxSize="2"
            />
          </div>
        </div>
        
        <div class="setting-actions">
          <button 
            @click="updateAvatar" 
            :disabled="!newAvatar || updating"
            class="save-btn"
          >
            <span v-if="updating" class="loading-spinner"></span>
            {{ updating ? '保存中...' : '保存头像' }}
          </button>
          <button @click="newAvatar = ''" class="cancel-btn" v-if="newAvatar">
            取消
          </button>
        </div>
      </div>
      
      <!-- 基本信息 -->
      <div class="setting-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>用户名</label>
            <div class="info-value">{{ userStore.user?.username }}</div>
          </div>
          <div class="info-item">
            <label>邮箱</label>
            <div class="info-value">{{ userStore.user?.email || '未设置' }}</div>
          </div>
          <div class="info-item">
            <label>注册时间</label>
            <div class="info-value">{{ formatDate(userStore.user?.createdAt) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 账户操作 -->
      <div class="setting-section">
        <h3>账户操作</h3>
        <div class="action-buttons">
          <button @click="logout" class="logout-btn">
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import UserAvatar from './UserAvatar.vue'
import ImageUpload from './ImageUpload.vue'
import api from '../services/api.js'

const router = useRouter()
const userStore = useUserStore()

// Reactive data
const newAvatar = ref('')
const updating = ref(false)

// Methods
const updateAvatar = async () => {
  if (!newAvatar.value) return
  
  updating.value = true
  try {
    const response = await api.put('/auth/update-avatar', {
      avatar: newAvatar.value
    })
    
    if (response.data.success) {
      // 更新本地用户信息
      userStore.setUser({
        ...userStore.user,
        avatar: newAvatar.value
      })
      
      // 清空表单
      newAvatar.value = ''
      
      alert('头像更新成功！')
    } else {
      alert('头像更新失败：' + response.data.message)
    }
  } catch (error) {
    console.error('更新头像失败:', error)
    alert('头像更新失败，请重试')
  } finally {
    updating.value = false
  }
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.user-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #1f2937;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 700;
}

.setting-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
}

.setting-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

h3 {
  color: #374151;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.avatar-setting {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.current-avatar {
  text-align: center;
}

.current-avatar p {
  margin-top: 10px;
  color: #6b7280;
  font-size: 14px;
}

.avatar-upload {
  flex: 1;
  max-width: 300px;
}

.setting-actions {
  display: flex;
  gap: 12px;
}

.save-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 600;
  color: #374151;
}

.info-value {
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 