import request from '@/utils/request'

// --- VO 定义 ---

export interface MyProjectVo {
    id: string
    name: string
    logo: string
    domain: string
    status: number // 0:审核中, 1:孵化中, 2:已驳回, 3:已完结 (后端未传时为null, 前端需兼容)
    statusText: string
    auditReason?: string
    teamSize: number
    createTime?: string
}

// 表单 DTO
export interface ProjectForm {
    id?: string
    title: string
    logo: string
    domain: string // 存字典 Key (如 SMART_AGRI)
    slogan: string
    mentorName: string
    teamSize: string // 后端定义为 String
    description: string
    needs: string
}

// 详情 VO (保持之前的定义)
export interface ProjectDetailVo {
    projectId: string
    title: string
    logo: string
    slogan: string
    status: string
    tags: string[] // [domain, statusText]
    schoolName: string
    leaderName: string
    mentorName: string
    teamSize: number
    description: string
    needs: string
}

// --- API 方法 ---

// 1. 获取列表
export function getMyProjectList(params: { pageNum: number; pageSize: number }) {
    return request.get('/mobile/project/my/list', { params })
}

// 2. 获取详情
export function getProjectDetail(id: string) {
    return request.get<any, ProjectDetailVo>(`/mobile/project/detail/${id}`)
}

// 3. 获取领域字典 (Map<String, String>)
export function getProjectDomains() {
    return request.get<any, Record<string, string>>('/mobile/project/getDomain')
}

// 4. 保存 (新增/编辑)
export function saveProject(data: ProjectForm) {
    return request.post('/mobile/project/save', data)
}

// 5. 删除
export function deleteProject(id: string) {
    return request.post(`/mobile/project/delete/${id}`)
}