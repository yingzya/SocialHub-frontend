<template>
  <div class="user-avatar" v-if="userStore.loggedIn">
    <img :src="userStore.avatar" alt="avatar" class="avatar" />
    <span>{{ userStore.username }}</span>
    <button @click="logout">退出</button>
  </div>
  <div v-else>
    <router-link to="/login">登录</router-link>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user.js'

const userStore = useUserStore()
userStore.fetchUser() // 页面加载时获取用户信息

const logout = () => userStore.logout()
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
button {
  padding: 2px 6px;
  cursor: pointer;
}
</style>
