<template>
  <div class="user-avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <img 
      :src="src || userStore.user?.avatar || userStore.avatar || defaultAvatar" 
      :alt="userStore.user?.username || userStore.username || '用户头像'" 
      class="avatar" 
      :style="{ width: size + 'px', height: size + 'px' }"
      @error="handleImageError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user.js'

const props = defineProps({
  src: String,
  size: {
    type: Number,
    default: 32
  }
})

const userStore = useUserStore()
const defaultAvatar = 'https://7.isyangs.cn/20250831/a906f449ce2047eca7ae8a39f97d6219.jpg'
const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
}
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
