# 多阶段构建：第一阶段 - 构建Vue.js应用（使用Node.js 20支持新版Vite）
FROM node:20-alpine as build-stage

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装所有依赖（包括devDependencies，用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 第二阶段 - Nginx服务器
FROM nginx:alpine

# 删除默认的nginx配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/conf.d/

# 复制构建后的静态文件
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]