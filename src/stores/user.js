import { defineStore } from 'pinia'
import { api } from '../services/api.js' 

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '未登录',
    avatar: 'https://7.isyangs.cn/20250831/a906f449ce2047eca7ae8a39f97d6219.jpg',
    token: localStorage.getItem('token') || null,
    loggedIn: !!localStorage.getItem('token')
  }),
  actions: {
    async fetchUser() {
      if (!this.token) return
      try {
        const res = await api.get('/auth/me', {
          headers: { Authorization: 'Bearer ' + this.token }
        })
        if (res.data.success) {
          this.username = res.data.username
          this.avatar = res.data.avatar || this.avatar
          this.loggedIn = true
        } else {
          this.logout()
        }
      } catch (err) {
        console.error('获取用户信息失败', err)
        this.logout()
      }
    },
    // 注册/登录后设置用户信息
    setUser({ token, username, avatar }) {
      this.token = token
      this.username = username
      this.avatar = avatar || this.avatar
      this.loggedIn = true
      localStorage.setItem('token', token)
    },
    logout() {
      this.token = null
      this.username = '未登录'
      this.avatar = 'https://7.isyangs.cn/20250831/a906f449ce2047eca7ae8a39f97d6219.jpg'
      this.loggedIn = false
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
  }
})
