<template>
  <div class="edit-edu bg-[#f7f8fa] min-h-screen">
    <van-nav-bar
        title="管理教育经历"
        left-arrow
        @click-left="$router.back()"
    />

    <div class="p-3 space-y-3">
      <div
          v-for="(item, index) in list"
          :key="index"
          class="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
      >
        <div>
          <div class="font-bold text-gray-800 text-base">{{ item.school }}</div>
          <div class="text-sm text-gray-600 mt-1">{{ item.degree }} · {{ item.major }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ item.startDate }} 至 {{ item.endDate }}</div>
        </div>
        <van-icon name="edit" class="text-blue-500 p-2 text-lg" @click="openEdit(index)" />
      </div>

      <van-button block type="dashed" icon="plus" class="mt-4" @click="openAdd">
        添加教育经历
      </van-button>
    </div>

    <div class="fixed bottom-0 w-full p-4 bg-white safe-area-bottom">
      <van-button block type="primary" @click="saveAll">保存修改</van-button>
    </div>

    <van-popup v-model:show="showPopup" position="bottom" round :style="{ height: '60%' }">
      <div class="p-4">
        <div class="text-center font-bold mb-4">{{ isEditMode ? '编辑' : '添加' }}经历</div>
        <van-form>
          <van-field v-model="currentItem.school" label="学校名称" placeholder="请输入" />
          <van-field v-model="currentItem.major" label="主修专业" placeholder="请输入" />
          <van-field v-model="currentItem.degree" label="学历" placeholder="本科/硕士" />
          <div class="grid grid-cols-2 gap-2">
            <van-field v-model="currentItem.startDate" label="开始时间" placeholder="2020-09" />
            <van-field v-model="currentItem.endDate" label="结束时间" placeholder="2024-06" />
          </div>
        </van-form>
        <div class="mt-6 flex gap-3">
          <van-button v-if="isEditMode" block type="danger" plain @click="handleDelete">删除</van-button>
          <van-button block type="primary" @click="handleConfirm">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getResumeDetail, saveResume, type StudentResumeVo, type EducationItem } from '@/api/mobile/resume'
import { showSuccessToast, showLoadingToast } from 'vant'

const router = useRouter()
// 维护整个简历对象，因为保存时需要传回 studentId 等信息（虽然 Controller 也会补全，但为了保险）
const fullResume = ref<Partial<StudentResumeVo>>({})
const list = ref<EducationItem[]>([])

const showPopup = ref(false)
const isEditMode = ref(false)
const editIndex = ref(-1)
const currentItem = ref<EducationItem>({ school: '', major: '', degree: '', startDate: '', endDate: '' })

onMounted(async () => {
  const res = await getResumeDetail()
  fullResume.value = res.data || {}
  // 确保 list 是数组，防止 null
  list.value = res.data?.educationHistory || []
})

// 打开添加
const openAdd = () => {
  isEditMode.value = false
  currentItem.value = { school: '', major: '', degree: '', startDate: '', endDate: '' }
  showPopup.value = true
}

// 打开编辑
const openEdit = (index: number) => {
  isEditMode.value = true
  editIndex.value = index
  // 深拷贝，防止直接修改列表
  currentItem.value = { ...list.value[index] }
  showPopup.value = true
}

// 确认弹窗 (暂存到前端列表)
const handleConfirm = () => {
  if (isEditMode.value) {
    list.value[editIndex.value] = { ...currentItem.value }
  } else {
    list.value.push({ ...currentItem.value })
  }
  showPopup.value = false
}

// 删除条目
const handleDelete = () => {
  list.value.splice(editIndex.value, 1)
  showPopup.value = false
}

// 最终提交到服务器
const saveAll = async () => {
  showLoadingToast('保存中...')
  try {
    // 构造请求数据：保留原有的其他字段，只更新 educationHistory
    const reqData = {
      ...fullResume.value,
      educationHistory: list.value
    }
    await saveResume(reqData)
    showSuccessToast('保存成功')
    setTimeout(() => router.back(), 500)
  } catch (e) {
    // error
  }
}
</script>