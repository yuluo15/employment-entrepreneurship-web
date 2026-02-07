<template>
  <div class="profile-page bg-[#f7f8fa] min-h-screen pb-10">

    <div class="relative bg-gradient-to-br from-[#3b82f6] to-[#2563eb] pt-12 pb-20 px-5 text-white">
      <div class="flex items-center" @click="toEditProfile">
        <van-image
            round
            width="64px"
            height="64px"
            :src="userInfo.avatar"
            class="border-2 border-white/30 mr-4"
            fit="cover"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-1">
            <h1 class="text-xl font-bold mr-2 truncate">{{ userInfo.name }}</h1>
            <van-tag round color="rgba(255,255,255,0.2)" text-color="#fff">
              <van-icon name="gem-o" class="mr-1" />2026届
            </van-tag>
          </div>
          <div class="text-sm opacity-90 truncate">
            {{ userInfo.school }} · {{ userInfo.major }}
          </div>
        </div>
        <van-icon name="arrow" class="opacity-60" />
      </div>
    </div>

    <div class="mx-3 -mt-10 relative z-10 bg-white rounded-xl shadow-sm overflow-hidden mb-3">
      <van-grid :border="false" :column-num="4" clickable>
        <van-grid-item to="/student/my/delivery">
          <template #icon>
            <span class="text-xl font-bold text-gray-800 font-mono">{{ stats.delivered }}</span>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1">已投递</span>
          </template>
        </van-grid-item>

        <van-grid-item to="/student/my/interview">
          <template #icon>
            <van-badge :content="stats.interview ? stats.interview : undefined" max="99" color="#ee0a24">
              <span class="text-xl font-bold text-gray-800 font-mono">{{ stats.interview }}</span>
            </van-badge>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1">待面试</span>
          </template>
        </van-grid-item>

        <van-grid-item to="/student/my/collection">
          <template #icon>
            <span class="text-xl font-bold text-gray-800 font-mono">{{ stats.collected }}</span>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1">我的收藏</span>
          </template>
        </van-grid-item>

        <van-grid-item to="/student/my/offer">
          <template #icon>
            <span class="text-xl font-bold text-[#f59e0b] font-mono">{{ stats.offer }}</span>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1 font-bold">OFFER</span>
          </template>
        </van-grid-item>
      </van-grid>
    </div>

    <div class="mx-3 space-y-3">

      <div class="bg-white rounded-xl overflow-hidden shadow-sm">
        <van-cell center is-link to="/student/resume/edit">
          <template #icon>
            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <van-icon name="description" class="text-blue-500" size="18" />
            </div>
          </template>
          <template #title>
            <div class="flex justify-between items-center">
              <span>我的在线简历</span>
              <van-tag
                  plain
                  type="primary"
                  size="medium"
                  class="mr-2 active:opacity-70"
                  @click.stop="showResumePreview = true"
              >
                <van-icon name="eye-o" class="mr-1"/>预览
              </van-tag>
            </div>
          </template>
          <template #label>
            <div class="flex items-center mt-1">
              <span class="text-xs text-gray-400 mr-2">完整度 {{ resumeScore }}%</span>
              <van-progress
                  :percentage="resumeScore"
                  :show-pivot="false"
                  stroke-width="4"
                  track-color="#f3f4f6"
                  :color="resumeColor"
                  class="w-24"
              />
            </div>
          </template>
        </van-cell>
      </div>

      <div class="bg-white rounded-xl overflow-hidden shadow-sm">
        <van-cell title="我发布的项目" is-link to="/student/my/projects" center>
          <template #icon>
            <div class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
              <van-icon name="bulb-o" class="text-purple-500" size="18" />
            </div>
          </template>
          <template #value>
            <span class="text-gray-400 text-xs">1个孵化中</span>
          </template>
        </van-cell>
      </div>

      <div class="bg-white rounded-xl overflow-hidden shadow-sm">
        <van-cell title="账号与安全" is-link center to="/student/settings/account">
          <template #icon>
            <div class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mr-3">
              <van-icon name="shield-o" class="text-orange-500" size="18" />
            </div>
          </template>
        </van-cell>
      </div>

      <div class="pt-6 pb-4">
        <van-button
            block
            plain
            hairline
            type="default"
            class="!border-none !bg-transparent text-red-500 text-base"
            @click="handleLogout"
        >
          退出当前账号
        </van-button>
      </div>
    </div>

    <van-popup
        v-model:show="showResumePreview"
        position="bottom"
        round
        :style="{ height: '85%' }"
        closeable
    >
      <div class="h-full flex flex-col">
        <div class="text-center font-bold text-lg py-4 border-b border-gray-100">
          简历预览 (HR视角)
        </div>
        <div class="flex-1 overflow-y-auto p-5 bg-white">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">{{ userInfo.name }}</h2>
            <p class="text-gray-500 mt-1">求职意向：Java后端开发 | 成都</p>
            <div class="flex justify-center gap-3 mt-2 text-sm text-gray-600">
              <span>2026届</span> | <span>{{ userInfo.school }}</span> | <span>{{ userInfo.major }}</span>
            </div>
          </div>

          <div class="space-y-6">
            <section>
              <h3 class="text-base font-bold border-l-4 border-blue-500 pl-2 mb-2">个人优势</h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                熟悉Java基础，掌握Spring Boot框架，有Vue开发经验...
              </p>
            </section>
            <section>
              <h3 class="text-base font-bold border-l-4 border-blue-500 pl-2 mb-2">实习经历</h3>
              <div class="text-sm">
                <div class="flex justify-between font-bold text-gray-700">
                  <span>某某科技公司</span>
                  <span>2025.07 - 至今</span>
                </div>
                <div class="text-xs text-gray-500 mb-1">后端开发实习生</div>
                <p class="text-gray-600 leading-relaxed">负责公司核心业务模块的接口开发与维护。</p>
              </div>
            </section>
          </div>

          <div class="mt-8 text-center">
            <van-button round type="primary" size="small" class="w-32" @click="showResumePreview = false">
              去优化简历
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

// 模拟数据
const userInfo = ref({
  name: '张鹏',
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  school: '新乡学院',
  major: '软件工程'
})

const stats = ref({
  delivered: 5,
  interview: 1,
  collected: 12,
  offer: 0 // 新增 OFFER
})

const resumeScore = ref(45)
const showResumePreview = ref(false) // 控制预览弹窗

const resumeColor = computed(() => {
  if (resumeScore.value < 60) return '#ff976a'
  if (resumeScore.value < 80) return '#1989fa'
  return '#07c160'
})

const toEditProfile = () => {
  // router.push('/student/profile/info')
  showToast('跳转个人信息编辑')
}

const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出当前账号吗？',
    confirmButtonColor: '#ee0a24'
  })
      .then(() => {
        userStore.logout()
        router.replace('/login')
      })
      .catch(() => {})
}
</script>

<style scoped>
:deep(.van-grid-item__content) {
  padding: 12px 8px;
}
</style>