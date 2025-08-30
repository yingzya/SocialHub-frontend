<template>
  <div>
    <h2>注册</h2>
    <input v-model="username" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button @click="registerUser">注册</button>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../services/api.js';

const router = useRouter();
const username = ref('');
const password = ref('');
const message = ref('');

const registerUser = async () => {
  try {
    const res = await auth.register(username.value, password.value);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      message.value = '注册成功';
      router.push('/home');
    } else {
      message.value = res.data.message;
    }
  } catch (err) {
    console.error(err);
    message.value = '请求错误';
  }
};
</script>
