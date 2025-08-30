<template>
  <div>
    <h2>帖子列表</h2>
    <div class="publish">
      <input v-model="newPost" placeholder="说点什么..." />
      <button @click="publish">发帖</button>
    </div>

    <PostItem
      v-for="post in posts"
      :key="post.id"
      :post="post"
      @refresh="loadPosts"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../services/api.js';
import PostItem from './PostItem.vue';

const posts = ref([]);
const newPost = ref('');

const loadPosts = async () => {
  try {
    const res = await api.get('/api/post/list');
    posts.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const publish = async () => {
  if (!newPost.value) return;
  try {
    await api.post('/api/post/publish', { content: newPost.value });
    newPost.value = '';
    loadPosts();
  } catch (err) {
    console.error(err);
  }
};

onMounted(loadPosts);
</script>

<style scoped>
.publish {
  margin-bottom: 1em;
}
.publish input {
  width: 70%;
  padding: 0.5em;
  margin-right: 0.5em;
}
.publish button {
  padding: 0.5em 1em;
}
</style>
