<template>
  <div class="error-page">
    <div class="content">
      <h1 class="code">403</h1>
      <h2 class="title">抱歉，您没有权限访问该页面</h2>
      <p class="desc">您当前的角色是：<el-tag>{{ userStore.role }}</el-tag>，无权访问此区域。</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

// 简单的映射逻辑，也可以抽取到工具类
const ROLE_HOME_MAP: Record<string, string> = {
  '管理员': '/admin/home',
  '学生': '/student/home',
  '企业': '/company/home'
}

const goHome = () => {
  const path = ROLE_HOME_MAP[userStore.role] || '/login'
  router.push(path)
}
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  text-align: center;

  .code {
    font-size: 120px;
    font-weight: bold;
    color: #409eff;
    margin: 0;
    line-height: 1.2;
  }

  .title {
    font-size: 24px;
    color: #333;
    margin: 20px 0;
  }

  .desc {
    color: #666;
    margin-bottom: 30px;
  }
}
</style>