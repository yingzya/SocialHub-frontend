<template>
  <div class="debug-panel">
    <div class="debug-card">
      <h3>🔧 系统诊断面板</h3>
      
      <div class="test-section">
        <h4>1. 后端连接测试</h4>
        <button @click="testBackendConnection" :disabled="testing" class="test-btn">
          {{ testing ? '测试中...' : '测试后端连接' }}
        </button>
        <div v-if="backendResult" class="test-result" :class="backendResult.success ? 'success' : 'error'">
          {{ backendResult.message }}
        </div>
      </div>

      <div class="test-section">
        <h4>2. 认证API测试</h4>
        <button @click="testAuthAPI" :disabled="testing" class="test-btn">
          {{ testing ? '测试中...' : '测试认证接口' }}
        </button>
        <div v-if="authResult" class="test-result" :class="authResult.success ? 'success' : 'error'">
          {{ authResult.message }}
        </div>
      </div>

      <div class="test-section">
        <h4>3. 帖子API测试</h4>
        <button @click="testPostAPI" :disabled="testing" class="test-btn">
          {{ testing ? '测试中...' : '测试帖子接口' }}
        </button>
        <div v-if="postResult" class="test-result" :class="postResult.success ? 'success' : 'error'">
          {{ postResult.message }}
        </div>
      </div>

      <div class="test-section">
        <h4>4. 用户信息API测试</h4>
        <button @click="testUserAPI" :disabled="testing" class="test-btn">
          {{ testing ? '测试中...' : '测试用户信息接口' }}
        </button>
        <div v-if="userResult" class="test-result" :class="userResult.success ? 'success' : 'error'">
          {{ userResult.message }}
        </div>
        <div v-if="userResult && userResult.success && userResult.users" class="user-list">
          <h5>用户列表：</h5>
          <ul>
            <li v-for="user in userResult.users" :key="user.id">
              ID: {{ user.id }}, 用户名: {{ user.username }}, 头像: {{ user.avatar ? '✅' : '❌' }}
            </li>
          </ul>
        </div>
      </div>

      <div class="test-section">
        <h4>5. 数据库状态诊断</h4>
        <button @click="diagnoseDatabaseStatus" :disabled="testing" class="test-btn">
          {{ testing ? '诊断中...' : '诊断数据库问题' }}
        </button>
        <div v-if="dbDiagnosis" class="test-result" :class="dbDiagnosis.hasIssues ? 'error' : 'success'">
          {{ dbDiagnosis.summary }}
        </div>
        <div v-if="dbDiagnosis && dbDiagnosis.details" class="diagnosis-details">
          <h5>诊断详情：</h5>
          <ul>
            <li v-for="(detail, index) in dbDiagnosis.details" :key="index" :class="detail.type">
              {{ detail.message }}
            </li>
          </ul>
          <div v-if="dbDiagnosis.solutions.length > 0" class="solutions">
            <h5>🔧 建议的解决方案：</h5>
            <ol>
              <li v-for="(solution, index) in dbDiagnosis.solutions" :key="index">
                {{ solution }}
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div class="test-section">
        <h4>6. JWT Token 调试</h4>
        <button @click="debugJwtToken" :disabled="testing" class="test-btn">
          {{ testing ? '调试中...' : '调试用户身份认证' }}
        </button>
        <div v-if="jwtResult" class="test-result" :class="jwtResult.success ? 'success' : 'error'">
          {{ jwtResult.message }}
        </div>
        <div v-if="jwtResult && jwtResult.details" class="jwt-debug-details">
          <h5>Token 调试信息：</h5>
          <div class="debug-info">
            <p><strong>当前用户token:</strong> {{ jwtResult.details.hasToken ? '✅ 已设置' : '❌ 未设置' }}</p>
            <p><strong>Token长度:</strong> {{ jwtResult.details.tokenLength || 'N/A' }}</p>
            <p><strong>后端解析结果:</strong> {{ jwtResult.details.backendParsed ? '✅ 成功' : '❌ 失败' }}</p>
          </div>
        </div>
      </div>

      <div class="test-section">
        <h4>7. 帖子用户关联分析</h4>
        <button @click="analyzePostUsers" :disabled="testing" class="test-btn">
          {{ testing ? '分析中...' : '分析帖子归属问题' }}
        </button>
        <div v-if="postAnalysis" class="test-result" :class="postAnalysis.hasIssues ? 'error' : 'success'">
          {{ postAnalysis.summary }}
        </div>
        <div v-if="postAnalysis && postAnalysis.details" class="post-analysis-details">
          <h5>帖子归属分析：</h5>
          <div class="analysis-charts">
            <div v-for="(stat, index) in postAnalysis.details.userStats" :key="index" class="user-stat">
              <span class="user-name">用户 {{ stat.userId }} ({{ stat.username }}):</span>
              <div class="stat-bar">
                <div class="stat-fill" :style="{ width: stat.percentage + '%' }"></div>
                <span class="stat-text">{{ stat.count }} 个帖子 ({{ stat.percentage }}%)</span>
              </div>
            </div>
          </div>
          <div v-if="postAnalysis.details.issues" class="issues-list">
            <h5>⚠️ 发现的问题：</h5>
            <ul>
              <li v-for="(issue, index) in postAnalysis.details.issues" :key="index">{{ issue }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="test-section">
        <h4>8. 原始帖子数据检查</h4>
        <button @click="checkRawPostData" :disabled="testing" class="test-btn">
          {{ testing ? '检查中...' : '检查数据库原始数据' }}
        </button>
        <div v-if="rawPostResult" class="test-result" :class="rawPostResult.success ? 'success' : 'error'">
          {{ rawPostResult.message }}
        </div>
        <div v-if="rawPostResult && rawPostResult.success" class="raw-post-details">
          <h5>数据库原始数据：</h5>
          <div class="raw-stats">
            <p><strong>总帖子数:</strong> {{ rawPostResult.totalPosts }}</p>
            <p><strong>user_id为null的帖子:</strong> 
              <span :class="rawPostResult.nullUserIdCount > 0 ? 'error-text' : 'success-text'">
                {{ rawPostResult.nullUserIdCount }} 个
              </span>
            </p>
            <p><strong>user_id正常的帖子:</strong> 
              <span class="success-text">{{ rawPostResult.validUserIdCount }} 个</span>
            </p>
          </div>
          <div v-if="rawPostResult.posts && rawPostResult.posts.length > 0" class="post-list">
            <h5>帖子详情：</h5>
            <div v-for="(post, index) in rawPostResult.posts.slice(0, 5)" :key="index" class="post-item">
              <p><strong>ID:</strong> {{ post.id }}</p>
              <p><strong>user_id:</strong> 
                <span :class="post.userId === null ? 'error-text' : 'success-text'">
                  {{ post.userId === null ? 'NULL ❌' : post.userId + ' ✅' }}
                </span>
              </p>
              <p><strong>内容:</strong> {{ post.content ? post.content.substring(0, 30) + '...' : 'N/A' }}</p>
              <hr/>
            </div>
            <p v-if="rawPostResult.posts.length > 5" class="more-posts">
              (显示前5个，总共{{ rawPostResult.posts.length }}个帖子)
            </p>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h4>📋 配置信息</h4>
        <ul class="config-list">
          <li><strong>前端地址:</strong> {{ frontendUrl }}</li>
          <li><strong>前端端口:</strong> {{ frontendPort }} <span v-if="!isStandardPort" class="port-warning">⚠️ 非标准端口</span></li>
          <li><strong>后端地址:</strong> {{ backendUrl }}</li>
          <li><strong>浏览器:</strong> {{ browserInfo }}</li>
        </ul>
      </div>

      <div class="help-section">
        <h4>❓ 常见问题解决方案</h4>
        <div class="help-item" v-if="!isStandardPort">
          <strong>⚠️ 端口配置问题:</strong>
          <p>检测到您使用的是非标准端口 {{ frontendPort }}，请确认：</p>
          <p>1. 后端CORS配置已包含此端口</p>
          <p>2. 尝试使用标准端口5173启动前端：npm run dev</p>
        </div>
        <div class="help-item">
          <strong>CORS错误:</strong>
          <p>1. 确保后端服务器正在运行 (http://localhost:8080)</p>
          <p>2. 检查后端CORS配置是否包含前端地址</p>
          <p>3. 重启后端服务器</p>
        </div>
        <div class="help-item">
          <strong>403 Forbidden错误:</strong>
          <p>1. 检查Spring Security配置</p>
          <p>2. 确认测试接口 /test/** 已被放行</p>
          <p>3. 查看后端控制台日志</p>
        </div>
        <div class="help-item">
          <strong>网络错误:</strong>
          <p>1. 检查防火墙设置</p>
          <p>2. 确认端口8080未被其他程序占用</p>
          <p>3. 尝试访问 http://localhost:8080/test/hello</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../services/api.js'

const testing = ref(false)
const backendResult = ref(null)
const authResult = ref(null)
const postResult = ref(null)
const userResult = ref(null)
const dbDiagnosis = ref(null)
const jwtResult = ref(null)
const postAnalysis = ref(null)
const rawPostResult = ref(null)

const frontendUrl = window.location.origin
const backendUrl = 'http://localhost:8080'
const browserInfo = navigator.userAgent.split(' ').slice(-2).join(' ')
const frontendPort = window.location.port
const isStandardPort = frontendPort === '5173'

const testBackendConnection = async () => {
  testing.value = true
  try {
    const response = await api.get('/test/hello')
    backendResult.value = {
      success: true,
      message: `✅ 后端连接成功! 响应: ${response.data.message}`
    }
  } catch (error) {
    let errorMsg = error.message || '网络错误'
    if (error.response?.status === 403) {
      errorMsg = `❌ 403 Forbidden - 可能是CORS配置问题，当前端口: ${frontendPort}`
    }
    backendResult.value = {
      success: false,
      message: `❌ 后端连接失败: ${errorMsg}`
    }
  }
  testing.value = false
}

const testAuthAPI = async () => {
  testing.value = true
  try {
    const response = await api.post('/test/echo', { test: 'auth api test' })
    authResult.value = {
      success: true,
      message: `✅ 认证接口正常! POST请求成功`
    }
  } catch (error) {
    authResult.value = {
      success: false,
      message: `❌ 认证接口测试失败: ${error.message || '网络错误'}`
    }
  }
  testing.value = false
}

const testPostAPI = async () => {
  testing.value = true
  try {
    const response = await api.get('/api/post/list')
    postResult.value = {
      success: true,
      message: `✅ 帖子接口正常! 获取到 ${response.data.length} 条帖子`
    }
  } catch (error) {
    postResult.value = {
      success: false,
      message: `❌ 帖子接口测试失败: ${error.message || '网络错误'}`
    }
  }
  testing.value = false
}

const testUserAPI = async () => {
  testing.value = true
  try {
    const response = await api.get('/test/users')
    if (response.data.success) {
      userResult.value = {
        success: true,
        message: `✅ 用户信息接口正常! 获取到 ${response.data.count} 条用户信息`,
        users: response.data.users
      }
    } else {
      userResult.value = {
        success: false,
        message: `❌ 用户信息接口返回错误: ${response.data.message}`
      }
    }
  } catch (error) {
    userResult.value = {
      success: false,
      message: `❌ 用户信息接口测试失败: ${error.message || '网络错误'}`
    }
  }
  testing.value = false
}

const diagnoseDatabaseStatus = async () => {
  testing.value = true
  const issues = []
  const solutions = []
  let hasIssues = false

  try {
    // 1. 测试用户信息获取
    const userResponse = await api.get('/test/users')
    if (!userResponse.data.success) {
      issues.push({ type: 'error', message: '❌ 无法获取用户列表' })
      solutions.push('检查数据库连接和用户表是否存在')
      hasIssues = true
    } else {
      const users = userResponse.data.users || []
      issues.push({ type: 'success', message: `✅ 成功获取 ${users.length} 个用户` })
      
      // 检查用户头像字段
      const usersWithoutAvatar = users.filter(user => !user.avatar)
      if (usersWithoutAvatar.length > 0) {
        issues.push({ 
          type: 'warning', 
          message: `⚠️ 发现 ${usersWithoutAvatar.length} 个用户缺少头像信息` 
        })
        solutions.push('执行数据库迁移脚本: migrate_add_avatar.sql')
        hasIssues = true
      } else if (users.length > 0) {
        issues.push({ type: 'success', message: '✅ 所有用户都有头像信息' })
      }
    }

    // 2. 测试帖子信息获取
    const postResponse = await api.get('/api/post/list')
    if (Array.isArray(postResponse.data)) {
      issues.push({ type: 'success', message: `✅ 成功获取 ${postResponse.data.length} 个帖子` })
      
      // 检查帖子的用户关联
      const postsWithInvalidUsers = postResponse.data.filter(post => !post.userId)
      if (postsWithInvalidUsers.length > 0) {
        issues.push({ 
          type: 'error', 
          message: `❌ 发现 ${postsWithInvalidUsers.length} 个帖子缺少用户关联` 
        })
        solutions.push('检查帖子表的user_id字段完整性')
        hasIssues = true
      }
    } else {
      issues.push({ type: 'error', message: '❌ 帖子数据格式异常' })
      hasIssues = true
    }

    // 3. 测试单个用户信息获取
    if (userResponse.data.success && userResponse.data.users?.length > 0) {
      const firstUserId = userResponse.data.users[0].id
      try {
        const singleUserResponse = await api.get(`/auth/user/${firstUserId}`)
        if (singleUserResponse.data.success) {
          issues.push({ type: 'success', message: '✅ 单个用户信息获取正常' })
        } else {
          issues.push({ 
            type: 'error', 
            message: `❌ 单个用户信息获取失败: ${singleUserResponse.data.message}` 
          })
          solutions.push('检查AuthController的getUserInfo方法')
          hasIssues = true
        }
      } catch (error) {
        issues.push({ 
          type: 'error', 
          message: `❌ 单个用户信息获取异常: ${error.message}` 
        })
        hasIssues = true
      }
    }

    // 设置诊断结果
    dbDiagnosis.value = {
      hasIssues,
      summary: hasIssues 
        ? `🔍 发现 ${issues.filter(i => i.type === 'error' || i.type === 'warning').length} 个问题` 
        : '✅ 数据库状态正常，没有发现问题',
      details: issues,
      solutions
    }

  } catch (error) {
    dbDiagnosis.value = {
      hasIssues: true,
      summary: '❌ 数据库诊断失败',
      details: [
        { type: 'error', message: `网络错误: ${error.message}` }
      ],
      solutions: [
        '确保后端服务正在运行',
        '检查网络连接',
        '查看后端控制台日志'
      ]
    }
  }
  
  testing.value = false
}

const debugJwtToken = async () => {
  testing.value = true
  try {
    const token = localStorage.getItem('token')
    const details = {
      hasToken: !!token,
      tokenLength: token ? token.length : null,
      backendParsed: false
    }
    
    if (token) {
      // 调用后端JWT调试接口
      try {
        const response = await api.get('/test/jwt-debug')
        details.backendParsed = response.data.success
        jwtResult.value = {
          success: true,
          message: `✅ Token 调试完成`,
          details: {
            ...details,
            backendMessage: response.data.message,
            tokenInfo: response.data
          }
        }
      } catch (error) {
        jwtResult.value = {
          success: false,
          message: `⚠️ Token 存在但后端解析失败`,
          details: {
            ...details,
            error: error.message
          }
        }
      }
    } else {
      jwtResult.value = {
        success: false,
        message: '❌ 没有找到用户Token，请先登录',
        details
      }
    }
  } catch (error) {
    jwtResult.value = {
      success: false,
      message: `❌ Token 调试失败: ${error.message || '网络错误'}`
    }
  }
  testing.value = false
}

const analyzePostUsers = async () => {
  testing.value = true
  const issues = []
  
  try {
    // 1. 获取所有帖子
    const postsResponse = await api.get('/api/post/list')
    if (!Array.isArray(postsResponse.data)) {
      postAnalysis.value = {
        hasIssues: true,
        summary: '❌ 无法获取帖子数据',
        details: { issues: ['帖子数据格式异常'] }
      }
      testing.value = false
      return
    }
    
    const posts = postsResponse.data
    const totalPosts = posts.length
    
    // 2. 获取所有用户
    const usersResponse = await api.get('/test/users')
    const users = usersResponse.data.success ? usersResponse.data.users : []
    
    // 3. 统计每个用户的帖子数量
    const userPostCount = {}
    posts.forEach(post => {
      const userId = post.userId
      userPostCount[userId] = (userPostCount[userId] || 0) + 1
    })
    
    // 4. 创建用户统计
    const userStats = Object.entries(userPostCount).map(([userId, count]) => {
      const user = users.find(u => u.id == userId)
      return {
        userId: parseInt(userId),
        username: user ? user.username : '未知用户',
        count: count,
        percentage: Math.round((count / totalPosts) * 100)
      }
    }).sort((a, b) => b.count - a.count)
    
    // 5. 检查问题
    if (userStats.length === 1) {
      issues.push('⚠️ 所有帖子都归属于同一个用户，这可能表明JWT解析有问题')
    }
    
    if (userStats.some(stat => stat.username === '未知用户')) {
      issues.push('⚠️ 发现帖子归属于不存在的用户ID')
    }
    
    const dominantUser = userStats[0]
    if (dominantUser && dominantUser.percentage > 80) {
      issues.push(`⚠️ 用户 ${dominantUser.username} 拥有 ${dominantUser.percentage}% 的帖子，可能存在归属问题`)
    }
    
    postAnalysis.value = {
      hasIssues: issues.length > 0,
      summary: issues.length > 0 
        ? `🔍 发现 ${issues.length} 个帖子归属问题` 
        : `✅ 帖子归属正常，${userStats.length} 个用户共 ${totalPosts} 个帖子`,
      details: {
        userStats,
        totalPosts,
        issues
      }
    }
    
  } catch (error) {
    postAnalysis.value = {
      hasIssues: true,
      summary: '❌ 帖子分析失败',
      details: {
        issues: [`网络错误: ${error.message}`]
      }
    }
  }
  
  testing.value = false
}

const checkRawPostData = async () => {
  testing.value = true
  try {
    const response = await api.get('/test/posts-raw')
    rawPostResult.value = {
      success: true,
      message: `✅ 成功获取原始帖子数据`,
      totalPosts: response.data.totalPosts,
      nullUserIdCount: response.data.nullUserIdCount,
      validUserIdCount: response.data.validUserIdCount,
      posts: response.data.posts
    }
  } catch (error) {
    rawPostResult.value = {
      success: false,
      message: `❌ 获取原始帖子数据失败: ${error.message || '网络错误'}`
    }
  }
  testing.value = false
}
</script>

<style scoped>
.debug-panel {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.debug-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.debug-card h3 {
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
  font-size: 24px;
}

.test-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
}

.test-section h4 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 16px;
}

.test-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.test-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-result {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.test-result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.test-result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.user-list {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  background: #e9ecef;
  border: 1px solid #dee2e6;
}

.user-list h5 {
  color: #495057;
  margin-bottom: 8px;
}

.user-list ul {
  list-style: none;
  padding: 0;
}

.user-list li {
  color: #343a40;
  padding: 4px 0;
}

.diagnosis-details {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.diagnosis-details h5 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 14px;
}

.diagnosis-details ul {
  list-style: none;
  padding: 0;
  margin-bottom: 16px;
}

.diagnosis-details li {
  padding: 6px 0;
  font-size: 14px;
}

.diagnosis-details li.success {
  color: #28a745;
}

.diagnosis-details li.warning {
  color: #ffc107;
}

.diagnosis-details li.error {
  color: #dc3545;
}

.solutions {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
}

.solutions h5 {
  color: #856404;
  margin-bottom: 8px;
}

.solutions ol {
  margin: 0;
  padding-left: 20px;
}

.solutions li {
  color: #856404;
  padding: 2px 0;
  font-size: 13px;
}

.jwt-debug-details {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #e9ecef;
  border: 1px solid #dee2e6;
}

.jwt-debug-details h5 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 14px;
}

.debug-info {
  background: white;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.debug-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #495057;
}

.post-analysis-details {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.post-analysis-details h5 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 14px;
}

.analysis-charts {
  margin-bottom: 16px;
}

.user-stat {
  margin-bottom: 12px;
}

.user-name {
  display: block;
  font-weight: bold;
  font-size: 13px;
  color: #495057;
  margin-bottom: 4px;
}

.stat-bar {
  position: relative;
  background: #e9ecef;
  border-radius: 4px;
  height: 24px;
  overflow: hidden;
}

.stat-fill {
  background: linear-gradient(90deg, #28a745, #34ce57);
  height: 100%;
  transition: width 0.3s ease;
}

.stat-text {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #495057;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

.issues-list {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 12px;
}

.issues-list h5 {
  color: #856404;
  margin-bottom: 8px;
}

.issues-list ul {
  margin: 0;
  padding-left: 20px;
}

.issues-list li {
  color: #856404;
  padding: 2px 0;
  font-size: 13px;
}

.raw-post-details {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.raw-post-details h5 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 14px;
}

.raw-stats {
  margin-bottom: 16px;
}

.raw-stats p {
  color: #495057;
  font-size: 14px;
  margin: 4px 0;
}

.raw-stats .success-text {
  color: #28a745;
  font-weight: bold;
}

.raw-stats .error-text {
  color: #dc3545;
  font-weight: bold;
}

.post-list {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 10px;
  background: #e9ecef;
}

.post-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ced4da;
}

.post-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.post-item p {
  margin: 4px 0;
  font-size: 13px;
  color: #495057;
}

.post-item hr {
  margin: 8px 0;
  border: none;
  border-top: 1px dashed #ced4da;
}

.more-posts {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
}

.info-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-section h4 {
  color: #495057;
  margin-bottom: 12px;
}

.config-list {
  list-style: none;
  padding: 0;
}

.config-list li {
  padding: 4px 0;
  font-size: 14px;
  color: #6c757d;
}

.port-warning {
  color: #856404;
  font-weight: bold;
  margin-left: 8px;
}

.help-section {
  padding: 16px;
  background: #fff3cd;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
}

.help-section h4 {
  color: #856404;
  margin-bottom: 16px;
}

.help-item {
  margin-bottom: 16px;
}

.help-item strong {
  color: #856404;
  display: block;
  margin-bottom: 8px;
}

.help-item p {
  color: #6c757d;
  margin: 4px 0;
  font-size: 14px;
  padding-left: 16px;
}
</style> 