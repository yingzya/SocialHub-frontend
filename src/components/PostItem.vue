<template>
  <div class="post">
    <p><strong>{{ post.userId }}:</strong> {{ post.content }}</p>
    <p>点赞: {{ post.likeCount }}</p>
    <button @click="toggleLike">{{ liked ? '取消点赞' : '点赞' }}</button>

    <div class="comments">
      <input v-model="newComment" placeholder="评论..." />
      <button @click="addComment">评论</button>
      <ul>
        <li v-for="c in comments" :key="c.id">{{ c.content }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { api }  from '../services/api.js';

const props = defineProps({ post: Object });
const emit = defineEmits(['refresh']);

const comments = ref([]);
const newComment = ref('');
const liked = ref(false);
const likeCount = ref(props.post.likeCount || 0);

// 加载评论
const loadComments = async () => {
  try {
    const res = await api.get('/api/post/list'); // 取整条帖子列表
    const p = res.data.find(p => p.id === props.post.id);
    comments.value = p?.comments || [];
    likeCount.value = p?.likeCount || 0;
  } catch (err) {
    console.error(err);
  }
};

// 切换点赞状态
const toggleLike = async () => {
  try {
    const res = await api.post(`/api/post/${props.post.id}/like`);
    liked.value = !liked.value;
    await loadComments(); // 重新获取最新点赞数
    emit('refresh');
  } catch (err) {
    console.error(err);
  }
};

// 添加评论
const addComment = async () => {
  if (!newComment.value) return;
  try {
    await api.post('/api/post/comment', {
      postId: props.post.id,
      content: newComment.value
    });
    newComment.value = '';
    await loadComments();
    emit('refresh');
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.post {
  border: 1px solid #ccc;
  padding: 1em;
  margin-bottom: 1em;
}
.comments {
  margin-top: 0.5em;
}
.comments input {
  width: 60%;
  padding: 0.3em;
  margin-right: 0.5em;
}
.comments button {
  padding: 0.3em 0.5em;
}
</style>
