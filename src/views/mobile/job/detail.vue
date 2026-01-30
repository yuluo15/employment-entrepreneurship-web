<template>
  <div class="job-detail pb-20 bg-white min-h-screen">
    <van-nav-bar
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
        :style="{ background: scrollTop > 50 ? '#fff' : 'transparent' }"
    >
      <template #title>
        <span v-if="scrollTop > 50" class="font-bold">{{ detail.title }}</span>
      </template>
    </van-nav-bar>

    <div v-if="loading" class="p-4 mt-10">
      <van-skeleton title :row="3" class="mb-8" />
      <van-skeleton title avatar :row="2" class="mb-8" />
      <van-skeleton title :row="10" />
    </div>

    <div v-else class="px-4 pt-2">
      <div class="pb-4 border-b border-gray-100">
        <div class="flex justify-between items-start mb-2">
          <h1 class="text-xl font-bold text-gray-900 w-3/4 leading-snug">{{ detail.title }}</h1>
          <span class="text-[#ff6034] font-bold text-lg">{{ detail.salaryRange }}</span>
        </div>

        <div class="flex items-center text-gray-500 text-sm mb-3">
          <span><van-icon name="location-o" /> {{ detail.city }}</span>
          <span class="mx-2 bg-gray-300 h-3 w-[1px]"></span>
          <span><van-icon name="manager-o" /> {{ detail.experience }}</span>
          <span class="mx-2 bg-gray-300 h-3 w-[1px]"></span>
          <span><van-icon name="notes-o" /> {{ detail.education }}</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <van-tag v-for="tag in detail.tags" :key="tag" color="#f3f4f6" text-color="#666" class="px-2 py-1">{{ tag }}</van-tag>
        </div>
      </div>

      <div class="py-4 border-b border-gray-100 flex items-center">
        <van-image round width="44px" height="44px" :src="detail.hrAvatar" class="mr-3 border border-gray-100" />
        <div class="flex-1">
          <div class="text-sm font-bold text-gray-800 flex items-center">
            {{ detail.hrName }}
            <van-icon name="wechat" class="ml-1 text-green-500" />
          </div>
          <div class="text-xs text-gray-500 mt-0.5">{{ detail.companyName }} · {{ detail.hrTitle }}</div>
        </div>
<!--        <van-button size="small" round plain type="primary" icon="chat-o">打招呼</van-button>-->
      </div>

      <div class="py-4">
        <h3 class="font-bold text-base mb-3 text-gray-800">职位描述</h3>
        <div class="job-content text-sm text-gray-600 leading-7" v-html="detail.description"></div>
      </div>

      <div class="mt-2 bg-[#f8f9fa] p-3 rounded-lg flex items-center active:bg-gray-100 transition-colors" @click="toCompany(detail.companyId)">
        <van-image width="48px" height="48px" radius="6px" :src="detail.companyLogo" class="mr-3 bg-white border border-gray-100" fit="contain" />
        <div class="flex-1 min-w-0">
          <div class="font-bold text-gray-800 text-sm truncate">{{ detail.companyName }}</div>
          <div class="text-xs text-gray-500 mt-1 truncate">
            {{ detail.companyScale }} · {{ detail.companyIndustry }}
          </div>
        </div>
        <van-icon name="arrow" color="#ccc" />
      </div>

      <div class="py-6">
        <h3 class="font-bold text-base mb-3 text-gray-800">工作地点</h3>
        <div class="flex items-start bg-white" @click="openMap(detail.address, detail.city)">
          <van-icon name="location" class="mr-1 mt-1 text-blue-500 shrink-0" size="16" />
          <div class="flex-1">
            <div class="text-sm text-gray-700 leading-relaxed">{{ detail.address }}</div>
            <div class="text-xs text-gray-400 mt-1">点击查看地图导航</div>
          </div>
          <van-icon name="arrow" color="#ccc" class="mt-1" />
        </div>
      </div>
    </div>

    <van-action-bar style="z-index: 1000;">
      <van-action-bar-icon icon="chat-o" text="沟通" color="#333" />
      <van-action-bar-icon icon="star-o" text="收藏" color="#333" />
<!--      <van-action-bar-button-->
<!--          color="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"-->
<!--          type="warning"-->
<!--          text="分享职位"-->
<!--      />-->
      <van-action-bar-button
          color="linear-gradient(to right, #43e97b 0%, #38f9d7 100%)"
          type="primary"
          text="立即投递"
          @click="handleApply"
      />
    </van-action-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getJobDetail, type JobDetailVo } from '@/api/mobile/job'
import { useEventListener } from '@vueuse/core'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const detail = ref<Partial<JobDetailVo>>({})
const scrollTop = ref(0)
const loading = ref(true)

useEventListener(window, 'scroll', () => {
  scrollTop.value = window.scrollY
})

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getJobDetail(id)
    detail.value = res.data
  } finally {
    // 模拟一下网络延迟，让骨架屏显示一会儿，更有质感
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
})

const toCompany = (id?: string) => {
  if (id) router.push(`/student/company/${id}`)
}

// [功能] 跳转百度地图 Web 接口
const openMap = (address?: string, city?: string) => {
  if (!address) return
  const fullKeyword = city ? `${city}${address}` : address
  // 使用百度地图 Web API，无需 Key
  window.location.href = `http://api.map.baidu.com/geocoder?address=${encodeURIComponent(fullKeyword)}&output=html&src=webapp.gxcj_system`
}

const handleApply = () => {
  showToast('简历投递成功！')
}
</script>

<style scoped>
/* 简单的富文本样式支持 */
.job-content {
  white-space: pre-line; /* 识别 \n */
}
:deep(.job-content b) {
  font-weight: bold;
  color: #333;
}
</style>