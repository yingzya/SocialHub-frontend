<template>
  <Teleport to="body">
    <div v-if="visible" class="toast-container">
      <div class="toast" :class="type">
        <span class="toast-icon">{{ getIcon() }}</span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success', // success, error, info
    validator: value => ['success', 'error', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 2000
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['hide'])

const visible = ref(false)

const getIcon = () => {
  switch (props.type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'info': return 'ℹ️'
    default: return '✅'
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('hide')
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: toastSlideIn 0.3s ease-out;
  pointer-events: auto;
}

.toast.success {
  border-left: 4px solid #28a745;
}

.toast.error {
  border-left: 4px solid #dc3545;
}

.toast.info {
  border-left: 4px solid #17a2b8;
}

.toast-icon {
  font-size: 16px;
}

.toast-message {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 