<template>
  <div class="profile-page bg-[#f7f8fa] min-h-screen pb-20">

    <div class="relative bg-gradient-to-br from-[#3b82f6] to-[#2563eb] pt-12 pb-20 px-5 text-white">
      <div class="flex items-center" @click="toEditProfile">
        <van-image
            round
            width="64px"
            height="64px"
            :src="profile.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            class="border-2 border-white/30 mr-4 bg-white/10"
            fit="cover"
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-1">
            <h1 class="text-xl font-bold mr-2 truncate">{{ profile.name || '同学' }}</h1>
            <van-tag round color="rgba(255,255,255,0.2)" text-color="#fff" v-if="profile.graduationYear">
              <van-icon name="gem-o" class="mr-1" />{{ profile.graduationYear }}届
            </van-tag>
          </div>
          <div class="text-sm opacity-90 truncate">
            {{ profile.schoolName }} · {{ profile.major }}
          </div>
        </div>

        <van-icon name="arrow" class="opacity-60" />
      </div>
    </div>

    <div class="mx-3 -mt-10 relative z-10 bg-white rounded-xl shadow-sm overflow-hidden mb-3">
      <van-grid :border="false" :column-num="4" clickable>
        <van-grid-item to="/student/my/delivery">
          <template #icon>
            <span class="text-xl font-bold text-gray-800 font-mono">{{ profile.deliveredCount || 0 }}</span>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1">已投递</span>
          </template>
        </van-grid-item>

        <van-grid-item to="/student/my/interview">
          <template #icon>
            <van-badge :content="profile.interviewCount ? profile.interviewCount : undefined" max="99" color="#ee0a24">
              <span class="text-xl font-bold text-gray-800 font-mono">{{ profile.interviewCount || 0 }}</span>
            </van-badge>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1">待面试</span>
          </template>
        </van-grid-item>

        <van-grid-item to="/student/my/collection">
          <template #icon>
            <span class="text-xl font-bold text-gray-800 font-mono">{{ profile.collectionCount || 0 }}</span>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1">我的收藏</span>
          </template>
        </van-grid-item>

        <van-grid-item to="/student/my/offer">
          <template #icon>
            <span class="text-xl font-bold text-gray-800 font-mono">{{ profile.offerCount || 0 }}</span>
          </template>
          <template #text>
            <span class="text-xs text-gray-500 mt-1">Offer</span>
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
<!--              <van-tag-->
<!--                  plain-->
<!--                  type="primary"-->
<!--                  size="medium"-->
<!--                  class="mr-2 active:opacity-70"-->
<!--                  @click.stop="showResumePreview = true"-->
<!--              >-->
<!--                <van-icon name="eye-o" class="mr-1"/>预览-->
<!--              </van-tag>-->
            </div>
          </template>
          <template #label>
            <div class="flex items-center mt-1">
              <span class="text-xs text-gray-400 mr-2">完整度 {{ profile.resumeComplete || 0 }}%</span>
              <van-progress
                  :percentage="profile.resumeComplete || 0"
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
            <span class="text-gray-400 text-xs" v-if="profile.projectCount > 0">{{ profile.projectCount }}个项目</span>
            <span class="text-gray-300 text-xs" v-else>暂无项目</span>
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

    </div>

<!--    <van-popup v-model:show="showResumePreview" position="bottom" round :style="{ height: '85%' }" closeable>-->
<!--      <div class="h-full flex items-center justify-center text-gray-500">简历预览内容区域</div>-->
<!--    </van-popup>-->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getProfileSummary, type StudentProfileVo } from '@/api/mobile/profile'
import { useUserStore } from '@/store/userStore' // 引入

const userStore = useUserStore() // 实例化

const router = useRouter()
const showResumePreview = ref(false)

// 响应式数据，默认为空对象
const profile = ref<Partial<StudentProfileVo>>({})

const resumeColor = computed(() => {
  const score = profile.value.resumeComplete || 0
  if (score < 60) return '#ff976a'
  if (score < 80) return '#1989fa'
  return '#07c160'
})

onMounted(async () => {
  try {
    const res = await getProfileSummary()
    profile.value = res.data

    // [新增] 将最新的头像和姓名同步到全局 Store
    // 这样进入简历预览页时，就能直接拿到了
    if (res.data.avatar || res.data.name) {
      userStore.setUserInfo({
        avatar: res.data.avatar,
        name: res.data.name
      })
    }

  } catch (error) {
    console.error('获取个人信息失败', error)
  }
})

const toEditProfile = () => {
  // 修改为真实的路由路径
  router.push('/student/profile/info')
}
</script>