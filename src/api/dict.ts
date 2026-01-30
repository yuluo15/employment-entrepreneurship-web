import request from '@/utils/request'

// --- 1. 实体定义 (与后端 Integer dictSort 保持一致) ---

export interface DictTypeEntity {
    id: string
    dictName: string
    dictType: string
    status: number
    remark: string
    createTime: string
}

export interface DictDataEntity {
    id: string
    dictSort: number  // [确认] 后端改为 Integer，前端对应 number
    dictLabel: string
    dictValue: string
    dictType: string
    status: number
    remark: string
}

// --- 2. 请求参数 DTO ---

export interface CreTypeReq {
    id?: string
    dictName: string
    dictType: string
    status: number
    remark?: string
}

export interface CreDataReq {
    id?: string
    dictSort: number // [确认] 提交 number
    dictLabel: string
    dictValue: string
    dictType: string
    status: number
    remark?: string
}

// --- 3. API 方法 ---

// 字典类型
export function getDictTypeList(params: { pageNum: number; pageSize: number; dictName?: string }) {
    return request.get('/dictMgr/listType', { params })
}
export function createDictType(data: CreTypeReq) {
    return request.post('/dictMgr/creType', data)
}
export function updateDictType(data: CreTypeReq) {
    return request.post('/dictMgr/updType', data)
}
export function deleteDictType(id: string) {
    return request.delete(`/dictMgr/delType/${id}`)
}

// 字典数据
export function getDictDataList(params: { pageNum: number; pageSize: number; dictType: string }) {
    return request.get('/dictMgr/list/data', { params })
}
export function createDictData(data: CreDataReq) {
    return request.post('/dictMgr/creData', data)
}
export function updateDictData(data: CreDataReq) {
    return request.post('/dictMgr/updData', data)
}
export function deleteDictData(id: string) {
    return request.delete(`/dictMgr/delData/${id}`)
}