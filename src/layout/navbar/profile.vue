<!--<template>-->
<!--  <el-dropdown trigger="click">-->
<!--    <el-avatar :size="30" class="cursor-pointer">U</el-avatar>-->
<!--    <template #dropdown>-->
<!--      <el-dropdown-menu>-->
<!--        <el-dropdown-item :icon="SwitchButton" @click="handleLogout">登出</el-dropdown-item>-->
<!--      </el-dropdown-menu>-->
<!--    </template>-->
<!--  </el-dropdown>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { SwitchButton } from '@element-plus/icons-vue'-->

<!--const router = useRouter()-->
<!--const handleLogout = () => {-->
<!--  router.push('/login')-->
<!--}-->
<!--</script>-->

<template>
  <div class="profile-container">
    <el-dropdown trigger="click">
      <div class="avatar-wrapper">
        <el-avatar :size="30" class="user-avatar" :src="avatarUrl">
          {{ userFirstChar }}
        </el-avatar>
        <span class="username">{{ userStore.userInfo?.nickname || '用户' }}</span>
        <el-icon class="el-icon--right"><caret-bottom /></el-icon>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :icon="SwitchButton" @click="handleLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { SwitchButton, CaretBottom } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
// 引入我们在 store 中写好的 userStore
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

// 模拟头像（如果后端返回了 avatar 字段，这里改成 userStore.userInfo.avatar）
const avatarUrl = computed(() => '')

// 计算名字首字，用于头像缺失时的展示
const userFirstChar = computed(() => {
  const name = userStore.userInfo?.showName || userStore.userInfo?.loginName || 'U'
  return name.charAt(0).toUpperCase()
})

const handleLogout = () => {
  // 增加确认弹窗，防止误触
  ElMessageBox.confirm('您确定要退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        // 1. 调用 Store 的 logout Action (清理 Pinia + LocalStorage)
        userStore.logout()

        // 2. 跳转回登录页
        router.push('/login')

        // 3. 提示成功
        ElMessage.success('退出登录成功')
      })
      .catch(() => {
        // 用户点击了取消，不做任何操作
      })
}
</script>

<style lang="scss" scoped>
.profile-container {
  margin-right: 20px;
  /* 如果你的 Navbar 是 flex 布局，这能保持一点距离 */
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none; // 去掉点击时的黑框

  .user-avatar {
    background-color: #409eff; // 给个默认底色，好看点
    margin-right: 8px;
  }

  .username {
    font-size: 14px;
    color: #333;
    margin-right: 4px;

    // 防止名字太长破坏布局
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
