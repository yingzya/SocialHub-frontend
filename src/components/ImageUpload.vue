<template>
  <div class="image-upload-btn">
    <!-- 隐藏的文件输入框 -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      @change="handleFileSelect"
      style="display: none"
    />
    
    <!-- 相机按钮 -->
    <button 
      type="button"
      @click="triggerFileInput" 
      :disabled="uploading"
      class="camera-btn"
      :class="{ 'uploading': uploading, 'has-image': previewUrl }"
      :title="uploading ? '上传中...' : (previewUrl ? '点击更换图片' : '添加图片')"
    >
      <span v-if="uploading" class="loading-spinner-mini"></span>
      <span v-else-if="previewUrl" class="camera-icon success">✓</span>
      <span v-else class="camera-icon">🖼️</span>
    </button>
    
    <!-- 图片预览（小窗口，仅在需要时显示） -->
    <div v-if="previewUrl && !uploading" class="mini-preview" @click="viewFullImage">
      <img :src="previewUrl" alt="预览" class="preview-mini" />
      <button @click.stop="removeImage" class="remove-mini-btn">×</button>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-toast">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '../services/api.js'

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

const viewFullImage = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}
</script>

<style scoped>
.image-upload-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 150px; /* Adjust as needed */
}

 .camera-btn {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   width: 40px;
   height: 40px;
   background-color: #f1f5f9; /* 浅灰色，和工具按钮一致 */
   color: #64748b; /* 灰色文字 */
   border: none;
   border-radius: 50%;
   cursor: pointer;
   transition: all 0.2s ease;
   box-shadow: none;
   font-size: 1.2rem;
   position: relative;
 }
 
 .camera-btn:hover:not(:disabled) {
   background-color: #e2e8f0;
   transform: scale(1.05);
 }
 
 .camera-btn:disabled {
   background-color: #d1d5db;
   cursor: not-allowed;
   color: #6b7280;
 }
 
 .camera-btn.uploading {
   background-color: #3b82f6; /* 上传时显示蓝色 */
   color: white;
 }
 
 .camera-btn.uploading:hover:not(:disabled) {
   background-color: #2563eb;
 }
 
 .camera-btn.has-image {
   background-color: #10b981; /* 有图片时显示绿色 */
   color: white;
 }
 
 .camera-btn.has-image:hover:not(:disabled) {
   background-color: #059669;
 }

.camera-icon {
  font-size: 1.2rem;
}

.camera-icon.success {
  font-size: 1.5rem;
}

.loading-spinner-mini {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4f46e5; /* Indigo 500 */
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mini-preview {
  position: absolute;
  top: 100%; /* Position below the button */
  left: 50%;
  transform: translateX(-50%);
  width: 100px; /* Small thumbnail size */
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb; /* Gray 200 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb; /* Gray 50 */
  z-index: 10; /* Ensure it's above other elements */
}

.preview-mini {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.preview-mini:hover {
  transform: scale(1.05);
}

.remove-mini-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  z-index: 10;
  transition: background 0.2s;
}

.remove-mini-btn:hover {
  background: rgba(239, 68, 68, 0.8);
}

.error-toast {
  position: absolute;
  top: 100%; /* Position below the button */
  left: 50%;
  transform: translateX(-50%);
  background-color: #ef4444;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.error-toast.show {
  opacity: 1;
}
</style> 