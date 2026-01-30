<template>
  <div class="project-detail pb-24 min-h-screen bg-[#f7f8fa]">
    <div
        class="fixed top-3 left-3 z-50 bg-black/20 rounded-full p-1.5 backdrop-blur-sm"
        @click="$router.back()"
    >
      <van-icon name="arrow-left" color="white" size="20" />
    </div>

    <div v-if="loading" class="p-4 pt-20">
      <van-skeleton title avatar :row="3" />
      <van-skeleton title :row="5" class="mt-8" />
    </div>

    <div v-else>
      <div class="bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] p-6 text-white pt-16 pb-16 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-10 -translate-y-10"></div>
        <div class="flex items-start z-10 relative mt-4">
          <van-image
              width="64px"
              height="64px"
              radius="12px"
              :src="detail.logo"
              class="mr-4 bg-white p-1 rounded-xl shadow-lg shrink-0"
          />
          <div class="flex-1 relative pr-16">
            <h1 class="text-xl font-bold mb-2 leading-snug">{{ detail.title }}</h1>
            <div class="text-xs opacity-80 mb-2 line-clamp-2">{{ detail.slogan }}</div>
            <div class="absolute top-0 right-[-10px]">
              <van-tag type="warning" mark size="medium">{{ detail.status }}</van-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="px-3 -mt-10 relative z-10 space-y-3">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-xs text-gray-400 mb-1">所属高校</div>
              <div class="text-sm font-bold text-gray-800 truncate">{{ detail.schoolName }}</div>
            </div>
            <div class="border-l border-gray-100">
              <div class="text-xs text-gray-400 mb-1">团队规模</div>
              <div class="text-sm font-bold text-gray-800">{{ detail.teamSize }}人</div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500 flex justify-between items-center">
            <div class="flex items-center">
              <van-icon name="manager" class="mr-1" /> 负责人: {{ detail.leaderName }}
            </div>
            <div class="flex items-center">
              <van-icon name="medal" class="mr-1" /> 导师: {{ detail.mentorName }}
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="font-bold text-gray-800 mb-3 border-l-4 border-[#7c3aed] pl-2 text-sm">项目介绍</h3>
          <div class="text-sm text-gray-600 leading-7 text-justify">
            {{ detail.description }}
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <van-tag v-for="tag in detail.tags" :key="tag" color="#f3f0ff" text-color="#7c3aed" class="px-2 py-1"># {{ tag }}</van-tag>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-gray-800 border-l-4 border-orange-500 pl-2 text-sm">寻找合伙人</h3>
            <span class="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">急需</span>
          </div>
          <div class="bg-[#fff7ed] p-3 rounded-lg text-sm text-[#c2410c] leading-relaxed mb-3">
            {{ detail.needs }}
          </div>
          <van-button block round color="linear-gradient(to right, #ff6034, #ee0a24)" size="small" @click="contactLeader">
            <template #icon><van-icon name="chat-o" /></template>
            联系负责人
          </van-button>
        </div>
      </div>
    </div>

    <van-action-bar style="z-index: 2000; padding-bottom: env(safe-area-inset-bottom);">
      <van-action-bar-icon icon="share-o" text="分享" />
      <van-action-bar-icon icon="star-o" text="关注" />
      <van-action-bar-button
          color="#7c3aed"
          type="primary"
          text="申请加入项目"
          @click="handleJoin"
      />
    </van-action-bar>
  </div>
</template>

<script setup lang="ts">
// ... (script 保持不变)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail, type ProjectDetailVo } from '@/api/mobile/project'
import { showToast } from 'vant'

const route = useRoute()
const detail = ref<Partial<ProjectDetailVo>>({})
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getProjectDetail(id)
    detail.value = res.data
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
})

const contactLeader = () => {
  showToast('已向负责人发送招呼')
}

const handleJoin = () => {
  showToast('申请已提交，请等待审核')
}
</script>