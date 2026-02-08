<template>
  <div class="collection-list bg-[#f7f8fa] min-h-screen">
    <van-nav-bar
        title="我的收藏"
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
        class="bg-white"
    />

    <van-tabs v-model:active="activeType" sticky offset-top="46px" color="#3b82f6" @change="onTabChange">
      <van-tab title="全部" name="" />
      <van-tab title="职位" name="JOB" />
      <van-tab title="项目" name="PROJECT" />
    </van-tabs>

    <div class="p-3">
      <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多收藏了"
          @load="onLoad"
      >
        <div
            v-for="item in list"
            :key="item.id"
            class="bg-white p-4 rounded-lg shadow-sm mb-3 active:bg-gray-50 transition-colors"
            @click="toDetail(item)"
        >
          <div class="flex items-start gap-3">
            <van-image
                width="64px"
                height="64px"
                radius="6px"
                :src="item.avatar"
                class="bg-gray-50 border border-gray-100 shrink-0"
                fit="cover"
            />

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-base text-gray-800 line-clamp-1">{{ item.title }}</span>
                <van-tag plain :type="item.type === 'JOB' ? 'primary' : 'success'" size="mini" class="ml-2 shrink-0">
                  {{ item.type === 'JOB' ? '职位' : '项目' }}
                </van-tag>
              </div>

              <div class="text-xs text-gray-500 mb-2 truncate">
                {{ item.subTitle }}
              </div>

              <div class="flex flex-wrap gap-2">
                <span
                    v-for="tag in item.tags"
                    :key="tag"
                    class="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded"
                >
                  <van-icon name="clock-o" class="mr-1" />{{ formatTimeTag(tag) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMyCollectionList } from '@/api/mobile/interaction'
import type { SearchResultVo } from '@/api/mobile/job'

const router = useRouter()
const activeType = ref('')
const list = ref<SearchResultVo[]>([])
const loading = ref(false)
const finished = ref(false)
const pageNum = ref(1)

// 处理后端返回的 "收藏于 2026-..." 字符串，稍微美化一下
const formatTimeTag = (tag: string) => {
  return tag.replace('T', ' ').split('.')[0] // 去掉毫秒和T
}

const onLoad = async () => {
  try {
    const res = await getMyCollectionList({
      pageNum: pageNum.value,
      pageSize: 10,
      type: activeType.value || undefined
    })

    const data = res.data?.data || []
    list.value.push(...data)
    pageNum.value++

    if (data.length < 10) finished.value = true
  } catch (e) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

const onTabChange = () => {
  list.value = []
  pageNum.value = 1
  finished.value = false
  loading.value = true
  onLoad()
}

const toDetail = (item: SearchResultVo) => {
  if (item.type === 'JOB') {
    router.push(`/student/job/${item.id}`)
  } else if (item.type === 'PROJECT') {
    router.push(`/student/project/${item.id}`) // 注意：collection表存的是项目ID
  }
}
</script>