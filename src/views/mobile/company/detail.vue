<template>
  <div class="company-detail bg-[#f7f8fa] min-h-screen pb-10">
    <van-nav-bar
        title="公司详情"
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
        class="bg-white"
    />

    <div v-if="loading" class="p-4 bg-white">
      <div class="flex flex-col items-center">
        <van-skeleton title avatar :row="3" class="w-full" />
      </div>
      <van-skeleton title :row="5" class="mt-8" />
    </div>

    <div v-else>
      <div class="bg-white p-6 pb-4 mb-2">
        <div class="flex flex-col items-center">
          <van-image
              width="72px"
              height="72px"
              radius="12px"
              :src="detail.logo"
              class="border border-gray-100 shadow-sm mb-3 bg-white p-1"
              fit="contain"
          />
          <h1 class="text-xl font-bold text-gray-900 text-center mb-1">{{ detail.name }}</h1>
          <div class="text-xs text-gray-500 mt-2 text-center flex flex-wrap justify-center gap-2">
            <span>{{ formatIndustry(detail.industry) }}</span>
            <span class="text-gray-300">|</span>
            <span>{{ detail.fundingStage }}</span>
            <span class="text-gray-300">|</span>
            <span>{{ detail.scale }}</span>
          </div>
        </div>
      </div>

      <van-tabs v-model:active="activeTab" sticky offset-top="46px" color="#3b82f6" shrink>
        <van-tab title="公司介绍">
          <div class="p-4 bg-white mt-2">
            <h3 class="font-bold text-base mb-3 border-l-4 border-blue-500 pl-2">公司简介</h3>
            <div class="text-sm text-gray-600 leading-7 mb-6 text-justify">
              {{ detail.description }}
            </div>

            <div v-if="detail.images && detail.images.length > 0">
              <h3 class="font-bold text-base mb-3 border-l-4 border-blue-500 pl-2">公司环境</h3>
              <div class="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                <van-image
                    v-for="(img, idx) in detail.images"
                    :key="idx"
                    width="140px"
                    height="90px"
                    radius="6px"
                    :src="img"
                    fit="cover"
                    @click="previewImage(idx)"
                />
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-start text-sm text-gray-600 mb-3" @click="openMap(detail.address)">
                <van-icon name="location-o" class="mr-2 mt-0.5 text-blue-500" />
                <span class="flex-1">{{ detail.address }}</span>
                <van-icon name="arrow" class="text-gray-300" />
              </div>
              <div class="flex items-center text-sm text-blue-600" v-if="detail.website">
                <van-icon name="link-o" class="mr-2" /> {{ detail.website }}
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab :title="`在招职位 (${detail.jobCount || 0})`">
          <div class="p-4 text-center text-gray-400 text-sm mt-10">
            <van-empty description="暂无职位数据" image="search" />
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCompanyDetail, type CompanyDetailVo } from '@/api/mobile/company'
import { showImagePreview } from 'vant'

const route = useRoute()
const detail = ref<Partial<CompanyDetailVo>>({})
const activeTab = ref(0)
const loading = ref(true)

// [优化] 简单字典翻译，防止出现 MANUFACTURE
const industryMap: Record<string, string> = {
  'MANUFACTURE': '生产制造',
  'REAL_ESTATE': '房地产',
  'INTERNET': '互联网',
  'FINANCE': '金融'
}

const formatIndustry = (list?: string[] | string) => {
  if (!list) return '行业未知'
  // 如果后端返回的是 String "MANUFACTURE,INTERNET"
  const arr = Array.isArray(list) ? list : (list as string).split(',')

  return arr.map(item => industryMap[item] || item).join(' / ')
}

const openMap = (address?: string) => {
  if (!address) return
  window.location.href = `http://api.map.baidu.com/geocoder?address=${encodeURIComponent(address)}&output=html&src=webapp.gxcj`
}

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getCompanyDetail(id)
    detail.value = res.data
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
})

const previewImage = (start: number) => {
  if (detail.value.images) {
    showImagePreview({
      images: detail.value.images,
      startPosition: start
    })
  }
}
</script>