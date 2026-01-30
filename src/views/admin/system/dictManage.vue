<template>
  <div class="app-container">
    <el-row :gutter="20" class="h-full">

      <el-col :span="10" :xs="24" class="mb-4">
        <el-card shadow="never" class="h-full flex-col-card">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-700">字典类型</span>
              <el-button type="primary" size="small" :icon="Plus" @click="openTypeDialog()">新增类型</el-button>
            </div>
          </template>

          <el-input
              v-model="typeQueryParams.dictName"
              placeholder="输入名称回车搜索"
              prefix-icon="Search"
              clearable
              class="mb-4"
              @keyup.enter="getTypeList"
              @clear="getTypeList"
          />

          <el-table
              v-loading="typeLoading"
              :data="typeList"
              highlight-current-row
              @current-change="handleTypeSelect"
              style="width: 100%; cursor: pointer;"
              height="100%"
              border
          >
            <el-table-column label="字典名称" prop="dictName" show-overflow-tooltip />
            <el-table-column label="类型标识" prop="dictType" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag size="small" effect="plain" type="info">{{ row.dictType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Edit" @click.stop="openTypeDialog(row)"></el-button>
                <el-button link type="danger" :icon="Delete" @click.stop="handleDeleteType(row)"></el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="mt-2 flex justify-end">
            <el-pagination
                small
                layout="prev, pager, next"
                :total="typeTotal"
                :page-size="typeQueryParams.pageSize"
                v-model:current-page="typeQueryParams.pageNum"
                @current-change="getTypeList"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="14" :xs="24">
        <el-card shadow="never" class="h-full flex-col-card">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-700">
                数据列表
                <span v-if="currentType" class="text-blue-500 text-sm ml-2">({{ currentType.dictName }})</span>
              </span>
              <el-button
                  type="success"
                  size="small"
                  :icon="Plus"
                  :disabled="!currentType"
                  @click="openDataDialog()"
              >
                新增数据
              </el-button>
            </div>
          </template>

          <el-table v-loading="dataLoading" :data="dataList" border style="width: 100%" height="100%">
            <el-table-column label="标签 (Label)" prop="dictLabel" min-width="120">
              <template #default="{ row }">
                <span class="font-medium">{{ row.dictLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column label="键值 (Value)" prop="dictValue" min-width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.dictValue }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="排序" prop="dictSort" width="70" align="center" />
            <el-table-column label="状态" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" show-overflow-tooltip />
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Edit" @click="openDataDialog(row)">编辑</el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDeleteData(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="mt-2 flex justify-end">
            <el-pagination
                small
                layout="prev, pager, next"
                :total="dataTotal"
                :page-size="dataQueryParams.pageSize"
                v-model:current-page="dataQueryParams.pageNum"
                @current-change="getDataList"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="typeDialog.visible" :title="typeDialog.title" width="500px" append-to-body destroy-on-close>
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="80px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="如：所属行业" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="typeForm.dictType" placeholder="如：sys_industry" :disabled="!!typeForm.id" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="typeForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="typeForm.remark" type="textarea" placeholder="请输入备注说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitTypeForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dataDialog.visible" :title="dataDialog.title" width="500px" append-to-body destroy-on-close>
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="dataForm.dictType" disabled />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="如：互联网/IT" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="如：IT" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="dataForm.dictSort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dataForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitDataForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDictTypeList, createDictType, updateDictType, deleteDictType,
  getDictDataList, createDictData, updateDictData, deleteDictData
} from '@/api/dict'

// --- State: 左侧类型 ---
const typeLoading = ref(false)
const typeList = ref([])
const typeTotal = ref(0)
const currentType = ref<any>(null)
const typeQueryParams = reactive({ pageNum: 1, pageSize: 10, dictName: '' })

// --- State: 右侧数据 ---
const dataLoading = ref(false)
const dataList = ref([])
const dataTotal = ref(0)
const dataQueryParams = reactive({ pageNum: 1, pageSize: 10 })

// --- Dialogs ---
const typeDialog = reactive({ visible: false, title: '' })
const dataDialog = reactive({ visible: false, title: '' })
const typeFormRef = ref()
const dataFormRef = ref()

// [修正] 默认状态设为 1 (正常)
const typeForm = reactive({ id: undefined, dictName: '', dictType: '', status: 1, remark: '' })
const dataForm = reactive({ id: undefined, dictLabel: '', dictValue: '', dictType: '', dictSort: 0, status: 1, remark: '' })

const typeRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入字典类型标识', trigger: 'blur' }]
}
const dataRules = {
  dictLabel: [{ required: true, message: '请输入数据标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入数据键值', trigger: 'blur' }]
}

// --- Methods: 左侧类型 ---

const getTypeList = async () => {
  typeLoading.value = true
  try {
    const res = await getDictTypeList(typeQueryParams)
    typeList.value = res.data?.data || []
    typeTotal.value = res.data?.total || 0
    if (!currentType.value && typeList.value.length > 0) {
      handleTypeSelect(typeList.value[0])
    }
  } finally {
    typeLoading.value = false
  }
}

const handleTypeSelect = (row: any) => {
  if (!row) return
  currentType.value = row
  dataQueryParams.pageNum = 1
  getDataList()
}

const openTypeDialog = (row?: any) => {
  typeDialog.visible = true
  typeDialog.title = row ? '修改字典类型' : '新增字典类型'

  nextTick(() => {
    typeFormRef.value?.resetFields()
    // [修正] 默认 1
    Object.assign(typeForm, { id: undefined, dictName: '', dictType: '', status: 1, remark: '' })

    if (row) {
      // 显式赋值，防止 undefined 覆盖
      typeForm.id = row.id
      typeForm.dictName = row.dictName
      typeForm.dictType = row.dictType
      typeForm.status = row.status
      typeForm.remark = row.remark
    }
  })
}

const submitTypeForm = () => {
  typeFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (typeForm.id) {
        await updateDictType(typeForm)
      } else {
        await createDictType(typeForm)
      }
      ElMessage.success('操作成功')
      typeDialog.visible = false
      getTypeList()
    }
  })
}

const handleDeleteType = (row: any) => {
  ElMessageBox.confirm(`确定删除字典类型【${row.dictName}】吗？`, '警告', { type: 'error' })
      .then(async () => {
        await deleteDictType(row.id)
        ElMessage.success('删除成功')
        if (currentType.value?.id === row.id) {
          currentType.value = null
          dataList.value = []
        }
        getTypeList()
      })
}

// --- Methods: 右侧数据 ---

const getDataList = async () => {
  if (!currentType.value) return
  dataLoading.value = true
  try {
    const res = await getDictDataList({
      ...dataQueryParams,
      dictType: currentType.value.dictType
    })
    dataList.value = res.data?.data || []
    dataTotal.value = res.data?.total || 0
  } finally {
    dataLoading.value = false
  }
}

const openDataDialog = (row?: any) => {
  dataDialog.visible = true
  dataDialog.title = row ? '修改字典数据' : '新增字典数据'

  nextTick(() => {
    dataFormRef.value?.resetFields()
    // [修正] 默认 1
    Object.assign(dataForm, {
      id: undefined,
      dictLabel: '',
      dictValue: '',
      dictType: currentType.value.dictType,
      dictSort: 0,
      status: 1,
      remark: ''
    })

    if (row) {
      Object.assign(dataForm, row)
    }
  })
}

const submitDataForm = () => {
  dataFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (dataForm.id) {
        await updateDictData(dataForm)
      } else {
        await createDictData(dataForm)
      }
      ElMessage.success('操作成功')
      dataDialog.visible = false
      getDataList()
    }
  })
}

const handleDeleteData = (row: any) => {
  ElMessageBox.confirm(`确定删除标签【${row.dictLabel}】吗？`, '警告', { type: 'warning' })
      .then(async () => {
        await deleteDictData(row.id)
        ElMessage.success('删除成功')
        getDataList()
      })
}

onMounted(() => {
  getTypeList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
  height: calc(100vh - 84px);
}

.flex-col-card {
  display: flex;
  flex-direction: column;
  :deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>