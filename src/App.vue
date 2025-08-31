<template>
    <router-view />
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
