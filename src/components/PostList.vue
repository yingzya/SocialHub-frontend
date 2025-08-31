<template>
  <div class="post-list-container">
    <div class="content-wrapper">
      <div class="page-header">
        <h2>🌟 社交广场</h2>
        <p>分享你的精彩瞬间</p>
      </div>
      
      <!-- 发帖表单 -->
      <div class="post-form">
        <div class="user-info">
          <UserAvatar :src="userStore.avatar" :size="40" />
          <span class="username">{{ userStore.username || '未登录' }}</span>
        </div>
        
        <textarea 
          v-model="newPost"
          placeholder="分享你的想法..."
          rows="3"
          :style="{ height: textareaHeight }"
          @input="autoResize"
          class="post-input"
        ></textarea>
        
        <div class="post-actions">
          <!-- 工具栏按钮 -->
          <div class="post-tools">
            <ImageUpload 
              v-model="postImageUrl" 
              class="tool-btn-upload"
            />
            <button type="button" class="tool-btn" title="表情">😊</button>
            <button type="button" class="tool-btn" title="位置">📍</button>
          </div>
          
          <button 
            @click="publishPost" 
            :disabled="!newPost.trim() || publishing"
            class="publish-btn"
          >
            <span v-if="publishing" class="loading-spinner"></span>
            {{ publishing ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>

      <div class="posts-section">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        
        <div v-else-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>还没有帖子</h3>
          <p>成为第一个分享动态的人吧！</p>
    </div>

        <div v-else class="posts-grid">
    <PostItem
      v-for="post in posts"
      :key="post.id"
      :post="post"
    />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { api } from '../services/api.js';
import { useUserStore } from '../stores/user.js';
import PostItem from './PostItem.vue';
import UserAvatar from './UserAvatar.vue';
import ImageUpload from './ImageUpload.vue';

const userStore = useUserStore()
const posts = ref([]);
const newPost = ref('');
const loading = ref(true);
const publishing = ref(false);
const textareaRef = ref(null);
const postImageUrl = ref('');
const textareaHeight = ref('60px'); // 新增：用于控制textarea高度

const loadPosts = async () => {
  try {
    loading.value = true;
    const res = await api.get('/api/post/list');
    posts.value = res.data;
  } catch (err) {
    console.error('加载帖子失败:', err);
  } finally {
    loading.value = false;
  }
};

const publishPost = async () => {
  if (!newPost.value.trim()) return;
  
  publishing.value = true;
  try {
    const postData = {
      content: newPost.value.trim(),
      imageUrl: postImageUrl.value || null
    };
    
    console.log('发布帖子:', postData);
    
    const response = await api.post('/api/post/publish', postData);
    
    if (response.data) {
      console.log('帖子发布成功:', response.data);
      
      // 清空表单
    newPost.value = '';
      postImageUrl.value = '';
      textareaHeight.value = 'auto';
      
      // 重新加载帖子列表
      await loadPosts();
      
      // 显示成功提示
      // Toast.success('帖子发布成功！');
    }
  } catch (error) {
    console.error('发布帖子失败:', error);
    // Toast.error('发布失败，请重试');
  } finally {
    publishing.value = false;
  }
};

const autoResize = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  const newHeight = Math.max(60, textarea.scrollHeight);
  textarea.style.height = newHeight + 'px';
  textareaHeight.value = newHeight + 'px';
};

const resetTextarea = () => {
  textareaHeight.value = '60px';
};

onMounted(() => {
  loadPosts();
  // 确保用户信息已加载
  if (userStore.loggedIn) {
    userStore.fetchUser();
  }
});
</script>

<style scoped>
.post-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 0;
}

.content-wrapper {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 700;
}

.page-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.publish-section {
  margin-bottom: 30px;
}

.publish-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.publish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.publish-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e3f2fd;
}

.username {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.post-textarea {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: border-color 0.3s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.post-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.post-textarea::placeholder {
  color: #aab8c2;
}

.publish-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f3f4;
}

.post-tools {
  display: flex;
  gap: 8px;
}

.tool-btn {
  background: none;
  border: 1px solid #e1e8ed;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: #f7f9fa;
  transform: scale(1.05);
}

/* 发帖表单样式 */
.post-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  width: 100%;
}

.username {
  font-weight: 600;
  color: #374151;
}

.post-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  min-height: 60px;
  font-family: inherit;
  transition: border-color 0.2s;
  margin: 0;
}

.post-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.post-input::placeholder {
  color: #9ca3af;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.post-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn-upload {
  /* ImageUpload组件自身样式 */
}

.tool-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  background-color: #e2e8f0;
  transform: scale(1.05);
}

.publish-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  justify-content: center;
}

.publish-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.publish-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
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

.posts-section {
  margin-top: 30px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e3f2fd;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 24px;
}

.empty-state p {
  font-size: 16px;
}

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 16px;
  }
  
  .page-header h2 {
    font-size: 28px;
  }
  
  .publish-card {
    padding: 20px;
  }
  
  .post-tools {
    gap: 4px;
  }
  
  .tool-btn {
    padding: 6px 10px;
    font-size: 16px;
  }
  
  .publish-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
