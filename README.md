### 目录结构

```
socialhub-frontend/
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile                    # Docker部署配置
├── .dockerignore                # Docker忽略文件
├── nginx.conf                   # Nginx配置
├── src/
│   ├── main.js                  # 应用入口
│   ├── App.vue                  # 根组件
│   ├── style.css               # 全局样式
│   ├── services/
│   │   └── api.js              # API接口封装
│   ├── stores/
│   │   └── user.js             # 用户状态管理(Pinia)
│   ├── components/
│   │   ├── Header.vue          # 页面头部
│   │   ├── Login.vue           # 登录页面
│   │   ├── Register.vue        # 注册页面
│   │   ├── PostList.vue        # 帖子列表
│   │   ├── PostItem.vue        # 单个帖子
│   │   ├── UserAvatar.vue      # 用户头像组件
│   │   ├── UserSettings.vue    # 用户设置页面
│   │   ├── ImageUpload.vue     # 图片上传组件
│   │   ├── Toast.vue           # 消息提示组件
│   │   └── DebugPanel.vue      # 调试面板
│   └── router/
│       └── index.js            # 路由配置
```

- **Vue.js 3** - 前端框架
-  **Vite** - 构建工具
-  **Vue Router** - 路由管理
-  **Pinia** - 状态管理
-  **Axios** - HTTP客户端
-  **CSS3** - 样式设计

### 访问地址

- **生产环境**: https://schub.yingzya.top
-  **本地前端**: http://localhost:5173  
-  **本地后端**: http://localhost:8080
-  **调试面板**: https://schub.yingzya.top/debug
