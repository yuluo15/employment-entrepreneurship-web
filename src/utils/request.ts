import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/userStore' // 引入 Store
import router from '@/router'

const service = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

service.interceptors.request.use(
    (config) => {
        // 【重点】这里不需要判断是否是登录接口，只需要判断有没有 Token
        const userStore = useUserStore()
        if (userStore.token) {
            config.headers['Authorization'] = userStore.token
        }
        return config
    },
    (error) => Promise.reject(error)
)

service.interceptors.response.use(
    (response) => {
        // 1. 如果是二进制数据 (Blob)，直接返回，不进行 code 校验
        // 判断依据：responseType 是 blob，或者 content-type 是 excel/stream
        const contentType = response.headers['content-type']
        if (
            response.config.responseType === 'blob' ||
            contentType?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
            contentType?.includes('application/octet-stream')
        ) {
            return response.data
        }
        const res = response.data
        if (res.message === 'success' || res.code === 200) {
            return res
        } else {
            ElMessage.error(res.message || '系统错误')
            return Promise.reject(new Error(res.message || 'Error'))
        }
    },
    (error) => {
        // 【补充】处理 401 Token 过期的情况
        if (error.response && error.response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            const userStore = useUserStore()
            userStore.logout() // 清除过期数据
            router.push('/login')
        } else {
            ElMessage.error(error.message || '网络请求失败')
        }
        return Promise.reject(error)
    }
)

export default service