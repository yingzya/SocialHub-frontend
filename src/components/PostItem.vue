<template>
  <div class="post">
    <div class="post-header">
      <div v-if="userInfo.username === '加载中...'" class="loading-skeleton">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-line skeleton-name"></div>
          <div class="skeleton-line skeleton-time"></div>
        </div>
      </div>
      <div v-else class="user-info-loaded">
        <img :src="userInfo.avatar" :alt="userInfo.username" class="avatar" />
        <div class="user-info">
          <strong>{{ userInfo.username }}</strong>
          <span class="post-time">{{ formatTime(post.createTime) }}</span>
        </div>
      </div>
    </div>
    <div class="post-content">
      <p>{{ post.content }}</p>
      
      <!-- 帖子图片 -->
      <div v-if="post.imageUrl" class="post-image">
        <img :src="post.imageUrl" :alt="post.content" @click="viewImage" />
      </div>
    </div>
    <div class="post-actions">
      <button 
        @click="toggleLike" 
        class="like-btn" 
        :class="{ liked, liking }"
        :disabled="liking"
      >
        <span class="like-icon" :class="{ 'like-animation': liking }">
          {{ liked ? '❤️' : '🤍' }}
        </span>
        <span class="like-count">{{ localLikeCount }}</span>
      </button>
    </div>

    <div class="comments">
      <div class="comment-input">
        <input 
          v-model="newComment" 
          placeholder="写点评论..." 
          @keyup.enter="addComment"
          :disabled="commenting"
        />
        <button @click="addComment" :disabled="commenting || !newComment.trim()">
          {{ commenting ? '发布中...' : '评论' }}
        </button>
      </div>
      <ul class="comment-list">
        <li 
          v-for="comment in commentsWithUserInfo" 
          :key="comment.id" 
          class="comment-item"
          :class="{ 'new-comment': comment.id === newCommentId }"
        >
          <div class="comment-header">
            <img :src="comment.userAvatar" :alt="comment.username" class="comment-avatar" />
            <div class="comment-user-info">
              <strong class="comment-username" :class="{ 'loading-text': comment.isLoading }">
                {{ comment.username }}
                <span v-if="comment.isLoading" class="loading-dots">...</span>
              </strong>
              <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
            </div>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
        </li>
      </ul>
    </div>
  </div>
  
  <!-- Toast 提示 -->
  <Toast 
    :message="toast.message"
    :type="toast.type"
    :show="toast.show"
    @hide="toast.show = false"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { api }  from '../services/api.js';
import Toast from './Toast.vue';

const props = defineProps({ post: Object });
// 移除refresh事件，现在使用本地状态管理

const comments = ref([]);
const newComment = ref('');
const liked = ref(false);
const liking = ref(false);
const commenting = ref(false);
const localLikeCount = ref(props.post.likeCount || 0);
const userInfo = ref({ username: '加载中...', avatar: '' });
const newCommentId = ref(null); // 追踪新添加的评论ID

// Toast 状态
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

// 显示 Toast 提示
const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  };
};

// 用户信息缓存
const userInfoCache = ref(new Map());

// 带用户信息的评论列表
const commentsWithUserInfo = computed(() => {
  return comments.value.map(comment => {
    const cachedUser = userInfoCache.value.get(comment.userId);
    return {
      ...comment,
      username: cachedUser?.username || '加载中...',
      userAvatar: cachedUser?.avatar || 'https://7.isyangs.cn/20250831/a906f449ce2047eca7ae8a39f97d6219.jpg',
      isLoading: !cachedUser
    };
  });
});

// 获取用户信息（带缓存）
const fetchUserInfo = async (userId, retryCount = 0) => {
  if (userInfoCache.value.has(userId)) {
    return userInfoCache.value.get(userId);
  }
  
  try {
    console.log(`获取用户信息: userId=${userId}`);
    const res = await api.get(`/auth/user/${userId}`);
    console.log(`用户信息响应:`, res.data);
    
    if (res.data.success) {
      const userInfo = {
        username: res.data.username,
        avatar: res.data.avatar || 'https://7.isyangs.cn/20250831/a906f449ce2047eca7ae8a39f97d6219.jpg'
      };
      userInfoCache.value.set(userId, userInfo);
      console.log(`缓存用户信息:`, userInfo);
      return userInfo;
    } else {
      console.warn(`获取用户信息失败: ${res.data.message}`);
    }
  } catch (err) {
    console.error(`获取用户信息失败 (userId: ${userId}):`, err);
    
    // 如果是第一次失败，等待1秒后重试一次
    if (retryCount === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserInfo(userId, 1);
    }
  }
  
  // 失败后使用默认信息
  const defaultInfo = { 
    username: `用户${userId}`, 
    avatar: 'https://7.isyangs.cn/20250831/a906f449ce2047eca7ae8a39f97d6219.jpg' 
  };
  userInfoCache.value.set(userId, defaultInfo);
  console.log(`使用默认用户信息:`, defaultInfo);
  return defaultInfo;
};

// 获取帖子作者信息
const loadPostUserInfo = async () => {
  const info = await fetchUserInfo(props.post.userId);
  userInfo.value = info;
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  
  return date.toLocaleDateString('zh-CN');
};

// 加载评论（优化版）
const loadComments = async () => {
  try {
    console.log('加载评论列表...');
    const res = await api.get('/api/post/list');
    const currentPost = res.data.find(p => p.id === props.post.id);
    if (currentPost) {
      comments.value = currentPost.comments || [];
      localLikeCount.value = currentPost.likeCount || 0;
      
      console.log(`找到 ${comments.value.length} 条评论`);
      
      // 异步加载评论用户信息
      const userIds = [...new Set(comments.value.map(c => c.userId))];
      console.log(`需要加载用户信息: ${userIds}`);
      
      // 并发加载所有用户信息
      const userPromises = userIds.map(userId => {
        if (!userInfoCache.value.has(userId)) {
          return fetchUserInfo(userId);
        }
        return Promise.resolve(userInfoCache.value.get(userId));
      });
      
      await Promise.allSettled(userPromises);
      console.log('所有用户信息加载完成');
    }
  } catch (err) {
    console.error('加载评论失败:', err);
    showToast('加载评论失败', 'error');
  }
};

// 优化后的点赞功能
const toggleLike = async () => {
  if (liking.value) return;
  
  liking.value = true;
  const originalLiked = liked.value;
  const originalCount = localLikeCount.value;
  
  // 立即更新UI（乐观更新）
  liked.value = !liked.value;
  localLikeCount.value += liked.value ? 1 : -1;
  
  try {
    await api.post(`/api/post/${props.post.id}/like`);
    // 成功后显示提示
    showToast(liked.value ? '点赞成功 ❤️' : '取消点赞', 'success');
    // 稍微延迟重置动画状态
    setTimeout(() => {
      liking.value = false;
    }, 300);
  } catch (err) {
    console.error('点赞失败:', err);
    // 失败时回滚状态
    liked.value = originalLiked;
    localLikeCount.value = originalCount;
    liking.value = false;
    showToast('操作失败，请稍后重试', 'error');
  }
};

// 优化后的添加评论
const addComment = async () => {
  if (!newComment.value.trim() || commenting.value) return;
  
  commenting.value = true;
  const commentContent = newComment.value.trim();
  
  try {
    const res = await api.post('/api/post/comment', {
      postId: props.post.id,
      content: commentContent
    });
    
    newComment.value = '';
    if (res.data && res.data.id) {
      newCommentId.value = res.data.id;
      // 3秒后重置新评论高亮
      setTimeout(() => {
        newCommentId.value = null;
      }, 3000);
    }
    await loadComments();
    commenting.value = false;
    showToast('评论发布成功 💬', 'success');
  } catch (err) {
    console.error('评论失败:', err);
    commenting.value = false;
    showToast('评论发布失败，请稍后重试', 'error');
  }
};

// 查看大图
const viewImage = (event) => {
  const imgSrc = event.target.src;
  window.open(imgSrc, '_blank');
};

// 监听帖子变化
watch(() => props.post, () => {
  localLikeCount.value = props.post.likeCount || 0;
  loadComments();
  loadPostUserInfo();
}, { immediate: false });

onMounted(() => {
  loadPostUserInfo();
  loadComments();
});
</script>

<style scoped>
.post {
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.loading-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #f0f2f5;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  background-color: #e0e0e0;
  border-radius: 50%;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-line {
  height: 14px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.skeleton-name {
  width: 60%;
}

.skeleton-time {
  width: 40%;
}

.user-info-loaded {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info strong {
  font-size: 14px;
  color: #1a1a1a;
}

.post-time {
  font-size: 12px;
  color: #657786;
}

.post-content {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.post-image {
  margin-top: 12px;
  text-align: center;
}

.post-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image img:hover {
  transform: scale(1.05);
}

.post-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.like-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #657786;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-btn:hover {
  background: #f7f9fa;
}

.like-btn.liked {
  color: #e0245e;
}

.like-btn.liking {
  opacity: 0.7;
  cursor: not-allowed;
}

.like-icon {
  transition: transform 0.3s ease;
  display: inline-block;
}

.like-animation {
  animation: likeHeartbeat 0.6s ease-in-out;
}

@keyframes likeHeartbeat {
  0% { transform: scale(1); }
  20% { transform: scale(1.4); }
  40% { transform: scale(1.1); }
  60% { transform: scale(1.3); }
  80% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.like-count {
  font-weight: bold;
  color: #1a1a1a;
  transition: all 0.3s ease;
  display: inline-block;
  min-width: 20px;
  text-align: center;
}

.liked .like-count {
  color: #e0245e;
  transform: scale(1.1);
  text-shadow: 0 0 4px rgba(224, 36, 94, 0.3);
}

.comments {
  border-top: 1px solid #e1e8ed;
  padding-top: 12px;
}

.comment-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 20px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.comment-input input:focus {
  border-color: #1da1f2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(29, 161, 242, 0.1);
}

.comment-input button {
  padding: 8px 16px;
  background: #1da1f2;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.comment-input button:hover {
  background: #1a91da;
}

.comment-input button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
  opacity: 0.7;
}

.comment-input button:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.comment-input button:active:before {
  width: 100px;
  height: 100px;
}

.comment-list {
  list-style: none;
  padding: 0;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f7f9fa;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.comment-item:hover {
  background-color: #f7f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.comment-item:hover .comment-avatar {
  transform: scale(1.1);
}

.comment-user-info {
  display: flex;
  flex-direction: column;
}

.comment-username {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: bold;
  transition: color 0.3s ease;
}

.comment-username.loading-text {
  color: #657786;
  font-style: italic;
}

.loading-dots {
  animation: blink 1.4s infinite both;
}

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

.comment-time {
  font-size: 12px;
  color: #657786;
}

.comment-content {
  font-size: 14px;
  line-height: 1.4;
  color: #1a1a1a;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-item:last-child {
  border-bottom: none;
}

.new-comment {
  animation: newCommentFadeIn 0.5s ease-out;
  background: linear-gradient(90deg, rgba(29, 161, 242, 0.1) 0%, rgba(29, 161, 242, 0.05) 100%);
  border-left: 3px solid #1da1f2;
  transform: scale(1.02);
}

@keyframes newCommentFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1.02);
  }
}

.skeleton-avatar,
.skeleton-line {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
