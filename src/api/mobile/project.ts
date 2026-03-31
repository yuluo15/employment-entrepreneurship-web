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
    pendingApplicationCount: number // 待审核申请数量
}

// 表单 DTO
export interface ProjectForm {
    id?: string
    title: string
    logo: string
    domain: string // 存字典 Key (如 SMART_AGRI)
    slogan: string
    mentorId: string // 改为 mentorId
    teamSize: string // 后端定义为 String
    description: string
    needs: string
}

// 教师信息 VO
export interface TeacherVo {
    teacherId: string
    teacherName: string
    teacherNo: string
    avatar: string
    title: string
    expertise: string
    expertiseCode: string
    schoolName: string
    collegeName: string
    intro: string
    guidanceCount: number
}

// 项目阶段 VO
export interface ProjectStageVo {
    stageId: string
    stageName: string
    stageOrder: number
    description: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    startTime?: string
    completeTime?: string
    guidanceCount: number
    canGuidance?: boolean // 教师端使用：是否可以指导
    guidanceList?: StageGuidanceVo[] // 指导记录列表（前端加载后填充）
}

// 项目阶段表单
export interface ProjectStageForm {
    stageId?: string
    stageName: string
    stageOrder: number
    description: string
    status?: string
}

// 阶段指导记录 VO
export interface StageGuidanceVo {
    id: string
    teacherId: string
    teacherName: string
    teacherAvatar: string
    content: string
    createTime: string
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
    leaderId: string
    leaderPhone: string // 负责人手机号
    mentorId?: string // 指导教师ID
    mentorName: string
    teamSize: number
    description: string
    needs: string
    isCollected: boolean
    isOwner: boolean // 是否是项目负责人
    isMentor?: boolean // 是否是指导教师（教师端使用）
    applicationStatus: string | null // 申请状态：null=未申请，PENDING=待审核，APPROVED=已通过，REJECTED=已拒绝
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

// 6. 申请加入项目
export function applyToJoinProject(data: {
    projectId: string
    applicationReason: string
    skills?: string
}) {
    return request.post('/mobile/project/apply', data)
}

// 7. 取消申请
export function cancelApplication(applicationId: string) {
    return request.put(`/mobile/project/apply/${applicationId}/cancel`)
}

// 8. 查看我的申请记录
export function getMyApplications(params: {
    pageNum: number
    pageSize: number
    status?: string
}) {
    return request.get('/mobile/project/my-applications', { params })
}

// 9. 获取项目的申请列表（项目负责人）
export function getProjectApplications(projectId: string, params: {
    pageNum: number
    pageSize: number
    status?: string
}) {
    return request.get(`/mobile/project/${projectId}/applications`, { params })
}

// 10. 处理申请（通过/拒绝）
export function handleApplication(applicationId: string, data: {
    action: 'APPROVE' | 'REJECT'
    replyMessage?: string
}) {
    return request.put(`/mobile/project/application/${applicationId}/handle`, data)
}

// 11. 获取我加入的项目列表
export function getMyJoinedProjects(params: {
    pageNum: number
    pageSize: number
    status?: string
}) {
    return request.get('/mobile/my/joined-projects', { params })
}

// 12. 获取教师列表（用于选择指导教师）
export function getTeacherList(params: {
    pageNum: number
    pageSize: number
    keyword?: string
    expertise?: string
}) {
    return request.get('/mobile/teacher/list', { params })
}

// 13. 保存项目阶段
export function saveProjectStages(data: {
    projectId: string
    stages: ProjectStageForm[]
}) {
    return request.post('/mobile/project/stages/save', data)
}

// 14. 获取项目阶段列表
export function getProjectStages(projectId: string) {
    return request.get<any, ProjectStageVo[]>(`/mobile/project/${projectId}/stages`)
}

// 15. 更新阶段状态
export function updateStageStatus(stageId: string, status: string) {
    return request.put(`/mobile/project/stage/${stageId}/status`, { status })
}

// 16. 获取阶段指导记录
export function getStageGuidance(stageId: string) {
    return request.get<any, StageGuidanceVo[]>(`/mobile/project/stage/${stageId}/guidance`)
}