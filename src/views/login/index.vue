<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-content">
      <div class="login-card">
        <div class="login-header">
          <img src="/1.png" alt="Logo" class="logo" />
          <h2 class="title">高校创业就业服务平台</h2>
          <p class="subtitle">一站式校园人才孵化方案</p>
        </div>

        <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            size="large"
        >
          <div class="mb-6">
            <h3 class="text-xl font-bold text-gray-700">账号登录</h3>
            <p class="text-gray-400 text-sm mt-1">请输入您的账号和密码</p>
          </div>

          <el-form-item prop="loginName">
            <el-input
                v-model="loginForm.loginName"
                placeholder="请输入账号/学号/工号"
                :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="flex justify-between items-center mb-6 text-sm">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          </div>

          <el-button
              type="primary"
              :loading="loading"
              class="w-full submit-btn"
              @click="handleLogin"
          >
            {{ loading ? '登录中...' : '立即登录' }}
          </el-button>

          <div class="mt-4 text-center text-gray-500 text-sm">
            还没有账号？
            <el-button link type="primary" @click="handleRegister">立即注册</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore' // 引入 Store
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/api/auth'

const userStore = useUserStore()
const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

// 定义后端返回的中文角色名 -> 前端首页路由的映射关系
// key: 后端 data.role 的值
// value: 前端要跳转的路径
const ROLE_PATH_MAP: Record<string, string> = {
  'ROLE_ADMIN': '/admin/home',
  'ROLE_SCHOOL': '/school/home',
  'ROLE_STUDENT': '/student/home',
  'ROLE_COMPANY': '/company/home',
  'ROLE_TEACHER': '/teacher/home'
}

const loginForm = reactive({
  loginName: 'zhangsan', // 方便调试
  password: '123456',
  remember: false
})

const loginRules = {
  loginName: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // 1. 直接调用 Store 的 login，它内部会处理好 token 和 storage
        const data = await userStore.login({
          loginName: loginForm.loginName,
          password: loginForm.password
        })

        ElMessage.success(`欢迎回来，${data.nickname}`)

        // 2. 获取跳转路径
        // 此时 store.role 已经是更新过的 "管理员" 了
        const targetPath = ROLE_PATH_MAP[data.role]

        if (targetPath) {
          // 3. 跳转
          console.log('准备跳转到:', targetPath) // 调试用
          await router.push(targetPath)
        } else {
          ElMessage.warning('未知的角色类型，无法跳转')
        }

      } catch (error) {
        console.error('登录失败', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = () => {
  // ElMessage.info('请联系辅导员或管理员开通账号')
  router.push('/register')
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/bg/bg01.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
  opacity: 0.8;
}

.login-content {
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 900px;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
}

.login-header {
  flex: 1;
  //background: linear-gradient(135deg, #1e293b 0%, #334155 100%); /* 稍微换了个深沉点的颜色 */
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;

  .logo {
    width: 80px;
    margin-bottom: 20px;
    background: white;
    border-radius: 50%;
    padding: 10px;
  }

  .title {
    font-size: 24px;
    margin-bottom: 10px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.8;
  }
}

.login-form {
  flex: 1;
  padding: 50px 40px; /* 增加一点内边距 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
}

.submit-btn {
  padding: 22px 0; /* 按钮做大一点 */
  font-size: 16px;
  letter-spacing: 2px;
  border-radius: 6px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    width: 100%;
    margin: 10px;
  }

  .login-header {
    padding: 30px 20px;
    flex: 0 0 auto;

    .logo {
      width: 50px;
      margin-bottom: 10px;
    }
    .title {
      font-size: 20px;
    }
  }

  .login-form {
    padding: 30px 20px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>