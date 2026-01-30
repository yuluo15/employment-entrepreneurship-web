// src/api/school.ts
import request from '@/utils/request'

// --- 1. 定义类型接口 (对应后端的 DTO) ---

export interface SchoolEntity {
    id: string
    name: string
    code: string
    adminAccount: string // 注意：后端叫 adminAccount
    logo: string
    contactPhone: string
    address: string
    status: number // 1:启用, 0:禁用
    createTime: string
}

// 新增参数
export interface CreateSchoolReq {
    name: string
    code: string
    email: string
    logo?: string
    contactPhone?: string
    address?: string
}

// 更新参数 (注意：后端UpdateReq没有code和adminAccount)
export interface UpdateSchoolReq {
    id: string
    name?: string
    logo?: string
    contactPhone?: string
    address?: string
}

// 分页查询参数
export interface SchoolQuery {
    pageNum: number
    pageSize: number
    name?: string
    status?: number | null // 支持传 null 查全部
}

// --- 2. API 方法定义 ---

// 获取列表
export function getSchoolList(params: SchoolQuery) {
    return request.get('/schoolMgr/list', { params })
}

// 新增学校
export function createSchool(data: CreateSchoolReq) {
    return request.post('/schoolMgr/createSchool', data)
}

// 更新学校
export function updateSchool(data: UpdateSchoolReq) {
    return request.post('/schoolMgr/updateSchool', data)
}

// 删除学校
export function deleteSchool(id: string) {
    return request.delete(`/schoolMgr/delete/${id}`)
}

// 重置密码
export function resetPassword(data: { id: string; newPassword: string }) {
    return request.post('/schoolMgr/resetPassword', data)
}

// 修改状态
export function updateStatus(data: { id: string; status: number }) {
    return request.post('/schoolMgr/updateStatus', data)
}

// 2. 获取已删除的学校列表
// 假设后端接口: GET /api/schoolMgr/deletedList
export function getDeletedSchoolList() {
    return request.get('/schoolMgr/deletedList')
}

// 3. 还原学校
// 假设后端接口: POST /api/schoolMgr/restore/{id}
export function restoreSchool(id: string) {
    return request.post(`/schoolMgr/restore/${id}`)
}