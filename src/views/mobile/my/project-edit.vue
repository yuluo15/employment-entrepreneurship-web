<template>
  <div class="project-edit bg-white min-h-screen">
    <van-nav-bar
        :title="isEdit ? '编辑项目' : '发布新项目'"
        left-text="取消"
        right-text="保存"
        left-arrow
        @click-left="$router.back()"
        @click-right="onSave"
    />

    <van-form class="mt-4">
      <van-cell-group inset>
        <div class="p-4 flex flex-col items-center justify-center border-b border-gray-50">
          <van-uploader
              v-model="fileList"
              :max-count="1"
              :after-read="afterRead"
              @delete="onDeleteLogo"
          >
            <div class="flex flex-col items-center text-gray-400">
              <div class="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300 mb-2">
                <van-icon name="plus" size="24" />
              </div>
              <span class="text-xs">上传项目Logo</span>
            </div>
          </van-uploader>
        </div>

        <van-field
            v-model="form.title"
            label="项目名称"
            placeholder="给项目起个响亮的名字"
            required
            :rules="[{ required: true, message: '请输入项目名称' }]"
        />

        <van-field
            v-model="form.slogan"
            label="Slogan"
            placeholder="一句话介绍项目亮点"
        />

        <van-field
            v-model="domainLabel"
            is-link
            readonly
            label="所属领域"
            placeholder="请选择"
            @click="showPicker = true"
            :rules="[{ required: true, message: '请选择所属领域' }]"
        />
        <van-popup v-model:show="showPicker" round position="bottom">
          <van-picker
              :columns="domainOptions"
              @cancel="showPicker = false"
              @confirm="onDomainConfirm"
          />
        </van-popup>

        <van-field name="teamSize" label="团队规模">
          <template #input>
            <van-stepper v-model="teamSizeNum" min="1" max="50" integer />
            <span class="ml-2 text-gray-500">人</span>
          </template>
        </van-field>

        <van-field
            v-model="selectedTeacherName"
            is-link
            readonly
            label="指导老师"
            placeholder="请选择指导老师"
            required
            @click="showTeacherPicker = true"
            :rules="[{ required: true, message: '请选择指导老师' }]"
        />
        <van-popup v-model:show="showTeacherPicker" round position="bottom">
          <van-picker
              :columns="teacherColumns"
              @cancel="showTeacherPicker = false"
              @confirm="onTeacherConfirm"
          />
        </van-popup>

        <van-field
            v-model="form.description"
            label="项目简介"
            type="textarea"
            rows="4"
            autosize
            placeholder="详细描述项目背景、痛点、解决方案..."
            show-word-limit
            maxlength="500"
        />

        <van-field
            v-model="form.needs"
            label="人才需求"
            type="textarea"
            rows="3"
            autosize
            placeholder="例如：需要前端开发2名，负责小程序界面..."
            show-word-limit
            maxlength="200"
        />
      </van-cell-group>

      <!-- 项目阶段设置 -->
      <van-cell-group inset class="mt-4">
        <van-cell title="项目阶段（选填）" title-class="font-bold" />
        <van-cell
            v-for="(stage, index) in stages"
            :key="index"
            :title="`阶段${index + 1}: ${stage.stageName}`"
            is-link
            @click="editStage(index)"
        >
          <template #right-icon>
            <van-icon name="delete-o" class="ml-2" @click.stop="deleteStage(index)" />
          </template>
        </van-cell>
        <van-cell>
          <van-button
              type="primary"
              size="small"
              plain
              block
              icon="plus"
              @click="addStage"
          >
            添加阶段
          </van-button>
        </van-cell>
      </van-cell-group>
    </van-form>

    <!-- 阶段编辑对话框 -->
    <van-dialog
        v-model:show="showStageDialog"
        title="编辑阶段"
        show-cancel-button
        :before-close="(action) => action === 'confirm' ? saveStage() : true"
    >
      <div class="p-4">
        <van-field
            v-model="currentStage.stageName"
            label="阶段名称"
            placeholder="如：需求调研"
            required
            :rules="[{ required: true, message: '请输入阶段名称' }]"
        />
        <van-field
            v-model="currentStage.description"
            label="阶段描述"
            type="textarea"
            rows="3"
            autosize
            placeholder="描述该阶段要完成的任务"
            show-word-limit
            maxlength="200"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectDetail, saveProject, getProjectDomains, getTeacherList, saveProjectStages, getProjectStages, type ProjectForm, type TeacherVo, type ProjectStageForm } from '@/api/mobile/project'
import { showSuccessToast, showLoadingToast, showFailToast } from 'vant'
import { uploadFile } from '@/api/common' // [新增] 引入上传接口

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = ref<ProjectForm>({
  id: '',
  title: '',
  logo: '',
  domain: '', // 存 Key (例如 INTERNET_PLUS)
  slogan: '',
  mentorId: '', // 改为 mentorId
  teamSize: '1',
  description: '',
  needs: ''
})

// 项目阶段数据
const stages = ref<ProjectStageForm[]>([])
const showStageDialog = ref(false)
const currentStageIndex = ref(-1)
const currentStage = ref<ProjectStageForm>({
  stageName: '',
  stageOrder: 1,
  description: '',
  status: 'NOT_STARTED'
})

const teamSizeNum = ref(1) //以此绑定 Stepper，提交时转 String
const fileList = ref<any[]>([])

// 字典相关
const showPicker = ref(false)
const domainOptions = ref<{ text: string, value: string }[]>([])
const domainLabel = ref('') // 用于显示中文

// 教师选择相关
const showTeacherPicker = ref(false)
const teacherList = ref<TeacherVo[]>([])
const teacherColumns = computed(() => 
  teacherList.value.map(t => ({
    text: t.teacherName,
    value: t.teacherId,
    teacher: t
  }))
)
const selectedTeacherName = ref('') // 用于显示选中的教师姓名

// 1. 初始化数据
onMounted(async () => {
  // 加载字典
  await loadDomains()
  
  // 加载教师列表
  await loadTeachers()

  // 如果是编辑，回显数据
  if (isEdit.value) {
    await loadDetail(route.params.id as string)
    // 加载项目阶段
    await loadStages(route.params.id as string)
  }
})

// 加载字典 Map -> Options Array
const loadDomains = async () => {
  try {
    const res = await getProjectDomains()
    const map = res.data || {}
    domainOptions.value = Object.entries(map).map(([key, value]) => ({
      text: value,
      value: key
    }))
  } catch (e) {
    console.error(e)
  }
}

// 加载教师列表
const loadTeachers = async () => {
  try {
    const res = await getTeacherList({ pageNum: 1, pageSize: 100 })
    // 后端返回的数据结构是 { data: { total: number, data: [] } }
    teacherList.value = res.data.data || []
    console.log('加载教师列表成功:', teacherList.value)
  } catch (e) {
    console.error('加载教师列表失败:', e)
  }
}

// 加载项目阶段
const loadStages = async (projectId: string) => {
  try {
    const res = await getProjectStages(projectId)
    stages.value = (res.data || []).map(stage => ({
      stageId: stage.stageId,
      stageName: stage.stageName,
      stageOrder: stage.stageOrder,
      description: stage.description,
      status: stage.status
    }))
  } catch (e) {
    console.error('加载项目阶段失败:', e)
  }
}

// 加载详情并回显
const loadDetail = async (id: string) => {
  try {
    const res = await getProjectDetail(id)
    const data = res.data

    form.value = {
      id: data.projectId,
      title: data.title,
      logo: data.logo,
      domain: '', // 稍后匹配
      slogan: data.slogan,
      mentorId: data.mentorId || '', // 回显 mentorId
      teamSize: String(data.teamSize),
      description: data.description,
      needs: data.needs
    }

    // 回显教师姓名
    selectedTeacherName.value = data.mentorName || ''

    // 图片回显
    if (data.logo) {
      fileList.value = [{ url: data.logo, isImage: true }]
    }
    // 规模回显
    teamSizeNum.value = Number(data.teamSize) || 1

    // 领域回显 (难点: tags 里是中文，需要反推 Key)
    if (data.tags && data.tags.length > 0) {
      // 假设 tags[0] 是领域中文名
      const label = data.tags[0]
      const found = domainOptions.value.find(opt => opt.text === label)
      if (found) {
        form.value.domain = found.value
        domainLabel.value = found.text
      } else {
        // 没找到匹配的字典，可能就是纯文本，暂时直接显示
        domainLabel.value = label
        form.value.domain = label // 这种情况下 Key 和 Label 一样
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// 选择器确认
const onDomainConfirm = ({ selectedOptions }) => {
  const opt = selectedOptions[0]
  if (opt) {
    domainLabel.value = opt.text
    form.value.domain = opt.value // 存 Key
  }
  showPicker.value = false
}

// 教师选择器确认
const onTeacherConfirm = ({ selectedOptions }) => {
  const opt = selectedOptions[0]
  if (opt && opt.teacher) {
    form.value.mentorId = opt.teacher.teacherId
    selectedTeacherName.value = opt.teacher.teacherName
  }
  showTeacherPicker.value = false
}

// [修改] 真实文件上传逻辑
const afterRead = async (fileObj: any) => {
  // 1. 设置状态为上传中
  fileObj.status = 'uploading'
  fileObj.message = '上传中...'

  try {
    // 2. 调用后端上传接口
    // fileObj.file 是原始 File 对象
    const res = await uploadFile(fileObj.file)

    // 3. 上传成功
    fileObj.status = 'done'
    fileObj.message = '上传成功'

    // 4. 将返回的 URL (OSS地址) 赋值给表单
    form.value.logo = res.data // 假设后端直接返回 url 字符串

    // 5. 替换 fileList 中的展示图片，确保预览的是服务器返回的 URL (可选)
    // fileList.value = [{ url: res.data, isImage: true }]

  } catch (error) {
    // 6. 上传失败处理
    fileObj.status = 'failed'
    fileObj.message = '上传失败'
    showFailToast('图片上传失败')
    // 清空 logo 防止提交错误的空值或旧值
    // form.value.logo = ''
  }
}

// [补充] 图片删除事件 (Vant Uploader 自带 delete 事件)
const onDeleteLogo = () => {
  form.value.logo = ''
  fileList.value = []
}

// 保存提交
const onSave = async () => {
  if (!form.value.title) return showFailToast('请填写项目名称')
  if (!form.value.domain) return showFailToast('请选择所属领域')
  if (!form.value.mentorId) return showFailToast('请选择指导老师')

  showLoadingToast('保存中...')
  try {
    // 同步 teamSize
    form.value.teamSize = String(teamSizeNum.value)

    // 保存项目基本信息
    console.log('=== 开始保存项目 ===')
    console.log('项目表单数据:', form.value)
    const res = await saveProject(form.value)
    console.log('保存项目返回结果:', res)
    console.log('res.data:', res.data)
    
    const projectId = form.value.id || res.data?.projectId
    console.log('最终的 projectId:', projectId)
    console.log('阶段数据:', stages.value)
    console.log('阶段数量:', stages.value.length)
    
    // 如果有阶段数据，保存阶段
    if (stages.value.length > 0) {
      if (!projectId) {
        console.error('错误：无法获取项目ID，无法保存阶段')
        console.error('form.value.id:', form.value.id)
        console.error('res.data?.projectId:', res.data?.projectId)
        showFailToast('项目保存失败：未获取到项目ID')
        return
      }
      
      console.log('=== 开始保存阶段 ===')
      console.log('保存阶段参数:', {
        projectId,
        stages: stages.value
      })
      
      try {
        const stageRes = await saveProjectStages({
          projectId,
          stages: stages.value
        })
        console.log('保存阶段返回结果:', stageRes)
      } catch (stageError) {
        console.error('保存阶段失败:', stageError)
        showFailToast('项目保存成功，但阶段保存失败: ' + (stageError.message || '未知错误'))
        return
      }
    } else {
      console.log('=== 没有阶段数据，跳过保存阶段 ===')
    }
    
    showSuccessToast(isEdit.value ? '修改成功' : '发布成功')
    setTimeout(() => router.back(), 500)
  } catch (e) {
    console.error('保存失败:', e)
    showFailToast('保存失败: ' + (e.message || '未知错误'))
  }
}

// 添加阶段
const addStage = () => {
  currentStageIndex.value = -1
  currentStage.value = {
    stageName: '',
    stageOrder: stages.value.length + 1,
    description: '',
    status: 'NOT_STARTED'
  }
  showStageDialog.value = true
}

// 编辑阶段
const editStage = (index: number) => {
  currentStageIndex.value = index
  currentStage.value = { ...stages.value[index] }
  showStageDialog.value = true
}

// 删除阶段
const deleteStage = (index: number) => {
  stages.value.splice(index, 1)
  // 重新排序
  stages.value.forEach((stage, idx) => {
    stage.stageOrder = idx + 1
  })
}

// 保存阶段
const saveStage = () => {
  if (!currentStage.value.stageName) {
    showFailToast('请输入阶段名称')
    return false
  }
  
  if (currentStageIndex.value === -1) {
    // 新增
    stages.value.push({ ...currentStage.value })
  } else {
    // 编辑
    stages.value[currentStageIndex.value] = { ...currentStage.value }
  }
  
  showStageDialog.value = false
  return true
}
</script>