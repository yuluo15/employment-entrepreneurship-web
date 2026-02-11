import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi, logoutApi, type LoginParams } from '@/api/auth'
import useTabStore from '@/store/tabs'

// 定义用户信息接口（补充 avatar 等字段）
interface UserInfo {
    userId: string
    loginName: string
    showName: string
    role: string
    token: string
    // [新增] 补充字段
    avatar?: string
    name?: string // 真实姓名
}

export const useUserStore = defineStore('user', () => {
    const userId = ref(localStorage.getItem('userId') || '')
    const token = ref(localStorage.getItem('token') || '')
    const role = ref(localStorage.getItem('role') || '')
    // 使用泛型定义
    const userInfo = ref<UserInfo | null>(localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') as string) : null)

    const login = async (loginForm: LoginParams) => {
        try {
            const res = await loginApi(loginForm)
            const data = res.data

            userId.value = data.userId
            token.value = data.token
            role.value = data.role
            userInfo.value = data

            localStorage.setItem('userId', data.userId)
            localStorage.setItem('token', data.token)
            localStorage.setItem('role', data.role)
            localStorage.setItem('userInfo', JSON.stringify(data))

            // 登录成功后重置标签页，使用当前用户角色
            const tabStore = useTabStore()
            tabStore.reset(data.role as any)

            return data
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        if (userId.value) {
            logoutApi(userId.value)
        }
        userId.value = ''
        token.value = ''
        role.value = ''
        userInfo.value = null
        localStorage.clear()
        sessionStorage.clear()
        const tabStore = useTabStore()
        tabStore.reset()
    }

    // [新增] 更新用户信息的 Action
    // 允许传入部分字段进行更新，例如只更新 avatar 和 name
    const setUserInfo = (info: Partial<UserInfo>) => {
        if (!userInfo.value) return

        // 合并新数据
        userInfo.value = { ...userInfo.value, ...info }
        // 同步到缓存，保证刷新不丢失
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    return { userId, token, role, userInfo, login, logout, setUserInfo }
})