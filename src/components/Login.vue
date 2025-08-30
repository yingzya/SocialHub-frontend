<template>
  <div>
    <h2>登录</h2>
    <input v-model="username" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button @click="loginUser">登录</button>
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

const loginUser = async () => {
  try {
    const res = await auth.login(username.value, password.value);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      message.value = '登录成功';
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
