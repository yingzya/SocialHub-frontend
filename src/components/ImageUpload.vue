<template>
  <div class="image-upload">
    <div class="upload-area" @click="triggerFileInput" :class="{ 'uploading': uploading }">
      <input 
        ref="fileInput" 
        type="file" 
        accept="image/*" 
        @change="handleFileSelect" 
        style="display: none"
      />
      
      <!-- 上传区域 -->
      <div v-if="!previewUrl && !uploading" class="upload-placeholder">
        <div class="upload-icon">📷</div>
        <p>{{ placeholder || '点击上传图片' }}</p>
        <small>支持 JPG、PNG、GIF 格式</small>
      </div>
      
      <!-- 上传中 -->
      <div v-if="uploading" class="uploading-state">
        <div class="loading-spinner"></div>
        <p>上传中...</p>
      </div>
      
      <!-- 预览图片 -->
      <div v-if="previewUrl && !uploading" class="preview-container">
        <img :src="previewUrl" alt="预览图片" class="preview-image" />
        <div class="preview-overlay">
          <button @click.stop="removeImage" class="remove-btn">✕</button>
          <button @click.stop="triggerFileInput" class="change-btn">更换</button>
        </div>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../services/api.js'

// Props
const props = defineProps({
  modelValue: String,
  placeholder: String,
  maxSize: {
    type: Number,
    default: 5 // MB
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Reactive data
const fileInput = ref(null)
const uploading = ref(false)
const error = ref('')
const previewUrl = ref(props.modelValue || '')

// Watch modelValue changes
watch(() => props.modelValue, (newValue) => {
  previewUrl.value = newValue || ''
})

// Watch previewUrl changes
watch(previewUrl, (newValue) => {
  emit('update:modelValue', newValue)
})

// Methods
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件
  error.value = ''
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }
  
  // 检查文件大小
  const maxSizeBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    error.value = `图片大小不能超过 ${props.maxSize}MB`
    return
  }
  
  // 开始上传
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      previewUrl.value = response.data.imageUrl
      console.log('图片上传成功:', response.data.imageUrl)
    } else {
      error.value = response.data.message || '上传失败'
    }
  } catch (err) {
    console.error('图片上传失败:', err)
    error.value = '上传失败，请重试'
  } finally {
    uploading.value = false
    // 清空input值，允许重新选择同一文件
    event.target.value = ''
  }
}

const removeImage = () => {
  previewUrl.value = ''
  error.value = ''
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-area.uploading {
  cursor: not-allowed;
  background: #f3f4f6;
}

.upload-placeholder {
  color: #6b7280;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.upload-placeholder p {
  margin: 8px 0 4px 0;
  font-weight: 500;
}

.upload-placeholder small {
  color: #9ca3af;
  font-size: 12px;
}

.uploading-state {
  color: #6b7280;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.remove-btn, .change-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.8);
}

.change-btn:hover {
  background: rgba(59, 130, 246, 0.8);
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}
</style> 