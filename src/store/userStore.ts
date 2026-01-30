import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi, logoutApi, type LoginParams } from '@/api/auth'
import useTabStore from '@/store/tabs'

export const useUserStore = defineStore('user', () => {
    const userId = ref(localStorage.getItem('userId') || '')
    const token = ref(localStorage.getItem('token') || '')
    const role = ref(localStorage.getItem('role') || '')
    const userInfo = ref(localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') as string) : null)

    const login = async (loginForm: LoginParams) => {
        try {
            // 1. 调用后端接口
            // res 的结构是: { message: "success", data: { userId: "...", ... } }
            const res = await loginApi(loginForm)

            // 2. 【关键修改】从 res.data 中提取真正的用户信息
            const data = res.data

            // 3. 更新 Pinia State
            userId.value = data.userId
            token.value = data.token
            role.value = data.role
            userInfo.value = data

            // 4. 持久化到 LocalStorage
            localStorage.setItem('userId', data.userId)
            localStorage.setItem('token', data.token)
            localStorage.setItem('role', data.role)
            localStorage.setItem('userInfo', JSON.stringify(data))

            // 返回解包后的数据，方便组件使用（比如显示欢迎语）
            return data
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        logoutApi(userId.value)
        userId.value = ''
        token.value = ''
        role.value = ''
        userInfo.value = null
        localStorage.clear()
        sessionStorage.clear()
        const tabStore = useTabStore()
        tabStore.reset()
    }

    return { userId, token, role, userInfo, login, logout }
})