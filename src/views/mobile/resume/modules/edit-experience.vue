<template>
  <div class="edit-exp bg-[#f7f8fa] min-h-screen pb-24">
    <van-nav-bar
        title="实习与项目经历"
        left-arrow
        @click-left="$router.back()"
    />

    <div class="mt-3">
      <div class="px-4 py-2 text-gray-500 text-sm font-bold flex justify-between items-center">
        <span>实习经历</span>
        <van-icon name="add-o" class="text-blue-600 text-lg" @click="openAdd('intern')" />
      </div>

      <div v-if="internList.length > 0" class="px-3 space-y-2">
        <div
            v-for="(item, index) in internList"
            :key="index"
            class="bg-white p-3 rounded-lg shadow-sm relative"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-bold text-gray-800">{{ item.company }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ item.startDate }} 至 {{ item.endDate }}</div>
            </div>
            <van-icon name="edit" class="text-gray-400 p-2" @click="openEdit('intern', index)" />
          </div>
          <div class="text-sm text-blue-600 mt-1">{{ item.role }}</div>
          <div class="text-xs text-gray-600 mt-2 line-clamp-2">{{ item.description }}</div>
        </div>
      </div>
      <div v-else class="px-3">
        <div class="bg-white p-4 rounded-lg text-center text-gray-400 text-xs border border-dashed border-gray-200" @click="openAdd('intern')">
          <van-icon name="plus" /> 添加一段实习经历
        </div>
      </div>
    </div>

    <div class="mt-6">
      <div class="px-4 py-2 text-gray-500 text-sm font-bold flex justify-between items-center">
        <span>项目经历</span>
        <van-icon name="add-o" class="text-blue-600 text-lg" @click="openAdd('project')" />
      </div>

      <div v-if="projectList.length > 0" class="px-3 space-y-2">
        <div
            v-for="(item, index) in projectList"
            :key="index"
            class="bg-white p-3 rounded-lg shadow-sm relative"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-bold text-gray-800">{{ item.projectName }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ item.startDate }} 至 {{ item.endDate }}</div>
            </div>
            <van-icon name="edit" class="text-gray-400 p-2" @click="openEdit('project', index)" />
          </div>
          <div class="text-sm text-purple-600 mt-1">{{ item.role }}</div>
          <div class="text-xs text-gray-600 mt-2 line-clamp-2">{{ item.description }}</div>
        </div>
      </div>
      <div v-else class="px-3">
        <div class="bg-white p-4 rounded-lg text-center text-gray-400 text-xs border border-dashed border-gray-200" @click="openAdd('project')">
          <van-icon name="plus" /> 添加一个项目经历
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 w-full p-4 bg-white safe-area-bottom shadow-t">
      <van-button block type="primary" @click="saveAll">保存所有修改</van-button>
    </div>

    <van-popup v-model:show="showInternPopup" position="bottom" round :style="{ height: '60%' }">
      <div class="p-4 h-full flex flex-col">
        <div class="text-center font-bold mb-4">{{ isEditMode ? '编辑' : '添加' }}实习</div>
        <van-form class="flex-1 overflow-y-auto">
          <van-field v-model="currentIntern.company" label="公司名称" placeholder="例如：腾讯科技" required />
          <van-field v-model="currentIntern.role" label="担任职位" placeholder="例如：后端开发实习生" required />
          <div class="grid grid-cols-2 gap-2">
            <van-field v-model="currentIntern.startDate" label="开始时间" placeholder="2023-07" />
            <van-field v-model="currentIntern.endDate" label="结束时间" placeholder="2023-09" />
          </div>
          <van-field
              v-model="currentIntern.description"
              label="工作内容"
              type="textarea"
              rows="3"
              placeholder="描述你的主要工作职责和成果..."
              show-word-limit
              maxlength="200"
          />
        </van-form>
        <div class="mt-4 flex gap-3 pb-2">
          <van-button v-if="isEditMode" block type="danger" plain @click="handleDelete('intern')">删除</van-button>
          <van-button block type="primary" @click="handleConfirmIntern">确定</van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showProjectPopup" position="bottom" round :style="{ height: '65%' }">
      <div class="p-4 h-full flex flex-col">
        <div class="text-center font-bold mb-4">{{ isEditMode ? '编辑' : '添加' }}项目</div>
        <van-form class="flex-1 overflow-y-auto">
          <van-field v-model="currentProject.projectName" label="项目名称" placeholder="例如：校园外卖平台" required />
          <van-field v-model="currentProject.role" label="担任角色" placeholder="例如：负责人 / 核心开发" required />
          <div class="grid grid-cols-2 gap-2">
            <van-field v-model="currentProject.startDate" label="开始时间" placeholder="2023-09" />
            <van-field v-model="currentProject.endDate" label="结束时间" placeholder="2024-01" />
          </div>
          <van-field
              v-model="currentProject.description"
              label="项目描述"
              type="textarea"
              rows="3"
              placeholder="项目背景、技术栈、你的贡献..."
              show-word-limit
              maxlength="300"
          />
          <van-field v-model="currentProject.projectLink" label="项目链接" placeholder="GitHub或演示地址 (可选)" />
        </van-form>
        <div class="mt-4 flex gap-3 pb-2">
          <van-button v-if="isEditMode" block type="danger" plain @click="handleDelete('project')">删除</van-button>
          <van-button block type="primary" @click="handleConfirmProject">确定</van-button>
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getResumeDetail, saveResume, type StudentResumeVo, type InternshipItem, type ProjectItem } from '@/api/mobile/resume'
import { showSuccessToast, showLoadingToast } from 'vant'

const router = useRouter()
const fullResume = ref<Partial<StudentResumeVo>>({})
const internList = ref<InternshipItem[]>([])
const projectList = ref<ProjectItem[]>([])

// 弹窗控制
const showInternPopup = ref(false)
const showProjectPopup = ref(false)
const isEditMode = ref(false)
const editIndex = ref(-1)

// 表单数据绑定
const currentIntern = ref<InternshipItem>({ company: '', role: '', startDate: '', endDate: '' })
const currentProject = ref<ProjectItem>({ projectName: '', role: '', startDate: '', endDate: '' })

onMounted(async () => {
  const res = await getResumeDetail()
  fullResume.value = res.data || {}
  internList.value = res.data?.internshipExp || []
  projectList.value = res.data?.projectExp || []
})

// --- 通用方法 ---

const openAdd = (type: 'intern' | 'project') => {
  isEditMode.value = false
  if (type === 'intern') {
    currentIntern.value = { company: '', role: '', startDate: '', endDate: '' }
    showInternPopup.value = true
  } else {
    currentProject.value = { projectName: '', role: '', startDate: '', endDate: '' }
    showProjectPopup.value = true
  }
}

const openEdit = (type: 'intern' | 'project', index: number) => {
  isEditMode.value = true
  editIndex.value = index
  if (type === 'intern') {
    currentIntern.value = { ...internList.value[index] }
    showInternPopup.value = true
  } else {
    currentProject.value = { ...projectList.value[index] }
    showProjectPopup.value = true
  }
}

const handleDelete = (type: 'intern' | 'project') => {
  if (type === 'intern') {
    internList.value.splice(editIndex.value, 1)
    showInternPopup.value = false
  } else {
    projectList.value.splice(editIndex.value, 1)
    showProjectPopup.value = false
  }
}

// --- 确认逻辑 ---

const handleConfirmIntern = () => {
  if (isEditMode.value) {
    internList.value[editIndex.value] = { ...currentIntern.value }
  } else {
    internList.value.push({ ...currentIntern.value })
  }
  showInternPopup.value = false
}

const handleConfirmProject = () => {
  if (isEditMode.value) {
    projectList.value[editIndex.value] = { ...currentProject.value }
  } else {
    projectList.value.push({ ...currentProject.value })
  }
  showProjectPopup.value = false
}

// --- 最终保存 ---

const saveAll = async () => {
  showLoadingToast('保存中...')
  try {
    const reqData = {
      ...fullResume.value,
      internshipExp: internList.value,
      projectExp: projectList.value
    }
    await saveResume(reqData)
    showSuccessToast('保存成功')
    setTimeout(() => router.back(), 500)
  } catch (e) {
    // error
  }
}
</script>

<style scoped>
/* 调整 Vant 输入框样式 */
:deep(.van-field__label) {
  width: 5em;
  font-weight: bold;
}
</style>