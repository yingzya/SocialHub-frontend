<template>
  <div>
    <nav>
      <router-link to="/home" v-if="isLogin">首页</router-link>
      <router-link to="/login" v-if="!isLogin">登录</router-link>
      <router-link to="/register" v-if="!isLogin">注册</router-link>
      <button v-if="isLogin" @click="logout">退出</button>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './services/api.js';

const router = useRouter();
const isLogin = ref(!!localStorage.getItem('token'));

const logout = () => {
  auth.logout();
  isLogin.value = false;
};
</script>

<style scoped>
nav {
  padding: 1em;
  background: #f0f0f0;
}
nav a {
  margin-right: 1em;
}
button {
  padding: 0.3em 0.6em;
}
</style>
