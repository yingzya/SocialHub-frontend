<template>
  <div class="post">
    <p>{{ post.content }}</p>
    <p>点赞: {{ likeCount }}</p>
    <button @click="like">点赞</button>

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
import { ref, onMounted } from 'vue';
import api from '../services/api.js';
const props = defineProps({ post: Object });
const emit = defineEmits(['refresh']);

const likeCount = ref(0);
const comments = ref([]);
const newComment = ref('');

const loadLikeCount = async () => {
  try {
    const res = await api.get(`/api/post/likeCount/${props.post.id}`);
    likeCount.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const loadComments = async () => {
  try {
    const res = await api.get('/api/post/list'); // 后端没单独接口，可以用list代替
    const p = res.data.find(p => p.id === props.post.id);
    comments.value = p.comments || [];
  } catch (err) {
    console.error(err);
  }
};

const like = async () => {
  try {
    await api.post(`/api/post/like/${props.post.id}`);
    loadLikeCount();
    emit('refresh');
  } catch (err) {
    console.error(err);
  }
};

const addComment = async () => {
  if (!newComment.value) return;
  try {
    await api.post('/api/post/comment', { postId: props.post.id, content: newComment.value });
    newComment.value = '';
    loadComments();
    emit('refresh');
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  loadLikeCount();
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
