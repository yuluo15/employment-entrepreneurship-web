import request from '@/utils/request'

// --- 类型定义 ---

// 学生查询参数
export interface StudentQuery {
  pageNum: number
  pageSize: number
  studentName?: string
  studentNo?: string
  collegeName?: string
  majorName?: string
  enrollmentYear?: number | null
  employmentStatus?: string
}

// 学生列表项
export interface StudentListItem {
  studentId: string
  userId: string
  schoolId: string
  studentName: string
  studentNo: string
  gender: string  // 1=男, 2=女
  collegeName: string
  majorName: string
  className: string
  education: string
  enrollmentYear: number
  graduationYear: number
  phone: string
  email: string
  employmentStatus: string  // 0=待就业, 1=已就业, 2=升学, 3=出国, 4=创业
  createTime: string
}

// 学生详情
export interface StudentDetail extends StudentListItem {
  updateTime: string
}

// 学生简历
export interface StudentResume {
  resumeId: string
  studentId: string
  expectedPosition: string
  expectedSalary: string
  targetCity: string
  jobType: number  // 1=全职, 2=实习
  arrivalTime: string
  personalSummary: string
  skills: string
  educationHistory: EducationItem[]
  internshipExp: InternshipItem[]
  projectExp: ProjectItem[]
  certificates: CertificateItem[]
  isPublic: number
  resumeScore: number
  viewCount: number
  createTime: string
  updateTime: string
}

// 教育经历
export interface EducationItem {
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
}

// 实习经历
export interface InternshipItem {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

// 项目经历
export interface ProjectItem {
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
}

// 证书
export interface CertificateItem {
  name: string
  issuer: string
  issueDate: string
}

// --- API 方法 ---

/**
 * 获取学生列表
 */
export function getStudentList(params: StudentQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof StudentQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof StudentQuery]
    }
  })
  return request.get<any, { data: { data: StudentListItem[], total: number } }>('/school/student/list', { params: cleanParams })
}

/**
 * 获取学生详情
 */
export function getStudentDetail(studentId: string) {
  return request.get<any, { data: StudentDetail }>(`/school/student/detail/${studentId}`)
}

/**
 * 获取学生简历
 */
export function getStudentResume(studentId: string) {
  return request.get<any, { data: StudentResume }>(`/school/student/resume/${studentId}`)
}

/**
 * 导出学生数据
 */
export function exportStudentData(params: StudentQuery) {
  return request.get('/school/student/export', { params, responseType: 'blob' })
}

/**
 * 下载导入模板
 */
export function downloadTemplate() {
  return request.get('/school/student/template', { responseType: 'blob' })
}

/**
 * 批量导入学生
 * 注意：这个接口通过 el-upload 组件的 action 属性调用，不需要手动调用
 */
export function importStudents(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/school/student/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// --- 就业情况管理 ---

// 就业查询参数
export interface EmploymentQuery {
  pageNum: number
  pageSize: number
  studentName?: string
  studentNo?: string
  employmentStatus?: string  // 0=待就业, 1=已就业
  graduationYear?: number | null
}

// 就业列表项
export interface EmploymentListItem {
  studentId: string
  studentName: string
  studentNo: string
  collegeName: string
  majorName: string
  graduationYear: number
  employmentStatus: string  // 0=待就业, 1=已就业
  companyName?: string
  position?: string
  salary?: string
  employmentDate?: string
  workLocation?: string
  remark?: string
}

// 就业详情
export interface EmploymentDetail extends EmploymentListItem {
  updateTime: string
}

// 就业表单
export interface EmploymentForm {
  studentId: string
  studentName: string
  studentNo: string
  majorName: string
  employmentStatus: string  // 0=待就业, 1=已就业
  companyName?: string
  position?: string
  salary?: string
  employmentDate?: string
  workLocation?: string
  remark?: string
}

// 就业统计
export interface EmploymentStats {
  totalCount: number
  employedCount: number
  employmentRate: number
}

/**
 * 获取就业列表
 */
export function getEmploymentList(params: EmploymentQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof EmploymentQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof EmploymentQuery]
    }
  })
  return request.get<any, { data: { data: EmploymentListItem[], total: number } }>('/school/employment/list', { params: cleanParams })
}

/**
 * 获取就业详情
 */
export function getEmploymentDetail(studentId: string) {
  return request.get<any, { data: EmploymentDetail }>(`/school/employment/detail/${studentId}`)
}

/**
 * 更新就业信息
 */
export function updateEmploymentInfo(data: EmploymentForm) {
  return request.put('/school/employment/update', data)
}

/**
 * 获取就业统计
 */
export function getEmploymentStats(params: EmploymentQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof EmploymentQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof EmploymentQuery]
    }
  })
  // 移除分页参数
  delete cleanParams.pageNum
  delete cleanParams.pageSize
  return request.get<any, { data: EmploymentStats }>('/school/employment/stats', { params: cleanParams })
}

/**
 * 导出就业数据
 */
export function exportEmploymentData(params: EmploymentQuery) {
  return request.get('/school/employment/export', { params, responseType: 'blob' })
}

// --- 教师档案管理 ---

// 教师查询参数
export interface TeacherQuery {
  pageNum: number
  pageSize: number
  name?: string
  employeeNo?: string
  collegeName?: string
  title?: string
}

// 教师列表项
export interface TeacherListItem {
  teacherId: string
  userId: string
  schoolId: string
  name: string
  employeeNo: string
  gender: string  // 1=男, 2=女
  collegeName: string
  title: string
  expertise: string
  intro: string
  guidanceCount: number
  ratingScore: number
  phone: string
  email: string
  createTime: string
}

// 教师详情
export interface TeacherDetail extends TeacherListItem {
  updateTime: string
}

/**
 * 获取教师列表
 */
export function getTeacherList(params: TeacherQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof TeacherQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof TeacherQuery]
    }
  })
  return request.get<any, { data: { data: TeacherListItem[], total: number } }>('/school/teacher/list', { params: cleanParams })
}

/**
 * 获取教师详情
 */
export function getTeacherDetail(teacherId: string) {
  return request.get<any, { data: TeacherDetail }>(`/school/teacher/detail/${teacherId}`)
}

/**
 * 下载教师导入模板
 */
export function downloadTeacherTemplate() {
  return request.get('/school/teacher/template', { responseType: 'blob' })
}

/**
 * 批量导入教师
 * 注意：这个接口通过 el-upload 组件的 action 属性调用，不需要手动调用
 */
export function importTeachers(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/school/teacher/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 导出教师数据
 */
export function exportTeacherData(params: TeacherQuery) {
  return request.get('/school/teacher/export', { params, responseType: 'blob' })
}

// --- 指导记录管理 ---

// 指导记录查询参数
export interface GuidanceQuery {
  pageNum: number
  pageSize: number
  teacherName?: string
  projectName?: string
  startTime?: string
  endTime?: string
}

// 指导记录列表项
export interface GuidanceListItem {
  id: string
  teacherId: string
  teacherName: string
  employeeNo: string
  collegeName: string
  title: string
  projectId: string
  projectName: string
  studentName: string
  content: string
  createTime: string
}

// 指导记录详情
export interface GuidanceDetail extends GuidanceListItem {
  studentNo: string
  domain: string
  teamSize: number
}

/**
 * 获取指导记录列表
 */
export function getGuidanceList(params: GuidanceQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof GuidanceQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof GuidanceQuery]
    }
  })
  return request.get<any, { data: { data: GuidanceListItem[], total: number } }>('/school/guidance/list', { params: cleanParams })
}

/**
 * 获取指导记录详情
 */
export function getGuidanceDetail(id: string) {
  return request.get<any, { data: GuidanceDetail }>(`/school/guidance/detail/${id}`)
}

// --- 创业项目管理 ---

// 项目查询参数
export interface ProjectQuery {
  pageNum: number
  pageSize: number
  projectName?: string
  studentName?: string
  domain?: string
  status?: string  // 0=待审核, 1=孵化中, 2=已驳回, 3=已落地
}

// 项目列表项
export interface ProjectListItem {
  projectId: string
  projectName: string
  logo: string
  studentName: string
  studentNo: string
  domain: string
  teamSize: number
  jobsCreated: number
  status: string  // 0=待审核, 1=孵化中, 2=已驳回, 3=已落地
  createTime: string
}

// 项目详情
export interface ProjectDetail extends ProjectListItem {
  userId: string
  schoolId: string
  slogan: string
  description: string
  needs: string
  mentorId: string
  mentorName: string
  mentorComment: string
  auditReason: string
  auditTime: string
  updateTime: string
}

// 审核表单
export interface AuditForm {
  projectId: string
  status: string  // 1=通过(孵化中), 2=驳回
  auditReason?: string  // 驳回原因（驳回时必填）
}

/**
 * 获取项目列表
 */
export function getProjectList(params: ProjectQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof ProjectQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof ProjectQuery]
    }
  })
  return request.get<any, { data: { data: ProjectListItem[], total: number } }>('/school/project/list', { params: cleanParams })
}

/**
 * 获取项目详情
 */
export function getProjectDetail(projectId: string) {
  return request.get<any, { data: ProjectDetail }>(`/school/project/detail/${projectId}`)
}

/**
 * 审核项目
 */
export function auditProject(data: AuditForm) {
  return request.put('/school/project/audit', data)
}

// --- 就业统计 ---

// 就业统计数据
export interface EmploymentStatsData {
  kpi: {
    totalGraduates: number
    employedCount: number
    employmentRate: string
    entrepreneurshipCount: number
    entrepreneurshipRate: string
    avgSalary: string
  }
  majorStats: Array<{
    majorName: string
    totalCount: number
    employedCount: number
    employmentRate: number
  }>
  employmentStatus: Array<{
    statusName: string
    count: number
  }>
  salaryDistribution: Array<{
    range: string
    count: number
  }>
  hotIndustries: Array<{
    industry: string
    count: number
  }>
  monthlyTrend: Array<{
    month: string
    count: number
  }>
}

/**
 * 获取学校就业统计数据
 */
export function getSchoolEmploymentStats(graduationYear: number, collegeName?: string) {
  const params: any = { graduationYear }
  if (collegeName) {
    params.collegeName = collegeName
  }
  return request.get<any, { data: EmploymentStatsData }>('/school/statistics/employment', { params })
}

// --- 创业统计 ---

// 创业统计数据
export interface EntrepreneurshipStatsData {
  kpi: {
    totalProjects: number
    incubatingCount: number
    incubatingRate: string
    pendingCount: number
    totalJobs: number
  }
  collegeList: string[]
  collegeStats: Array<{
    collegeName: string
    count: number
  }>
  statusDistribution: Array<{
    statusName: string
    count: number
  }>
  domainDistribution: Array<{
    domain: string
    count: number
  }>
  teamSizeDistribution: Array<{
    range: string
    count: number
  }>
  monthlyTrend: Array<{
    month: string
    newCount: number
    approvedCount: number
  }>
  successStats: {
    approvalRate: string
    approvedCount: number
    submittedCount: number
    landingRate: string
    landedCount: number
    avgTeamSize: number
  }
}

/**
 * 获取学校创业统计数据
 */
export function getSchoolEntrepreneurshipStats(collegeName?: string) {
  const params: any = {}
  if (collegeName) {
    params.collegeName = collegeName
  }
  return request.get<any, { data: EntrepreneurshipStatsData }>('/school/statistics/entrepreneurship', { params })
}

// --- 通知公告管理 ---

// 通知查询参数
export interface SchoolNoticeQuery {
  pageNum: number
  pageSize: number
  noticeTitle?: string
  noticeType?: string | null  // 1=通知, 2=公告, 3=政策, 4=新闻
  source?: string | null  // admin=管理员发布, school=本校发布
}

// 通知列表项
export interface SchoolNoticeItem {
  noticeId: string
  noticeTitle: string
  noticeType: string
  noticeContent: string
  status: number  // 0=草稿, 1=已发布
  isTop: number  // 0=否, 1=是
  viewCount: number
  createBy: string
  createTime: string
  updateTime: string
  publishTime?: string
  publisherType?: string  // 'admin' 或 'school' - 用于判断是否为管理员公告
  publisherId?: string  // 发布者ID（学校ID或NULL）
  targetAudience?: string  // 'all' 或 'student' - 目标受众
}

// 通知表单
export interface SchoolNoticeForm {
  noticeId?: string
  noticeTitle: string
  noticeType: string
  noticeContent: string
  status?: number  // 0=草稿, 1=已发布
}

/**
 * 获取学校通知列表（包含管理员发布的和本校发布的）
 */
export function getSchoolNoticeList(params: SchoolNoticeQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof SchoolNoticeQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof SchoolNoticeQuery]
    }
  })
  return request.get<any, { data: { data: SchoolNoticeItem[], total: number } }>('/school/notice/list', { params: cleanParams })
}

/**
 * 新增学校通知
 */
export function addSchoolNotice(data: SchoolNoticeForm) {
  return request.post('/school/notice/add', data)
}

/**
 * 更新学校通知
 */
export function updateSchoolNotice(data: SchoolNoticeForm) {
  return request.put('/school/notice/update', data)
}

/**
 * 删除学校通知
 */
export function deleteSchoolNotice(noticeId: string) {
  return request.delete(`/school/notice/delete/${noticeId}`)
}

/**
 * 发布学校通知
 */
export function publishSchoolNotice(noticeId: string) {
  return request.put(`/school/notice/publish/${noticeId}`)
}

/**
 * 停用学校通知
 */
export function unpublishSchoolNotice(noticeId: string) {
  return request.put(`/school/notice/unpublish/${noticeId}`)
}

// --- 学校工作台 ---

// 工作台数据
export interface SchoolDashboardData {
  schoolName: string
  studentCount: number
  teacherCount: number
  employmentRate: string
  incubatingProjectCount: number
  pendingProjects: Array<{
    projectId: string
    projectName: string
    logo: string
    studentName: string
    domain: string
    createTime: string
  }>
  latestNotices: Array<{
    noticeId: string
    noticeTitle: string
    noticeType: string
    isTop: number
    publishTime: string
  }>
  employmentTrend: {
    months: string[]
    rates: number[]
  }
  projectStatus: Array<{
    statusName: string
    count: number
  }>
  collegeStats: Array<{
    collegeName: string
    employmentRate: number
  }>
}

/**
 * 获取学校工作台数据
 */
export function getSchoolDashboard() {
  return request.get<any, { data: SchoolDashboardData }>('/school/dashboard')
}


// 学校实体 VO
export interface SchoolVo {
  id: string
  name: string
  code: string
  contactPhone: string
  address: string
  status: number // 状态
  logo: string
  createBy?: string
  createTime?: string
  updateTime?: string
  defaultAccountId?: string // 默认管理员账号ID
  email?: string // 扩展字段
}

// 列表查询参数
export interface SchoolQueryParams {
  pageNum: number
  pageSize: number
  name?: string
  status?: number
}

// 创建学校参数 (SchoolCreateReq)
export interface SchoolCreateReq {
  name: string
  code: string
  email: string
  contactPhone: string
  logo?: string
  address?: string
}

// 更新学校参数 (SchoolUpdateReq)
export interface SchoolUpdateReq {
  id: string
  name?: string
  logo?: string
  contactPhone?: string
  address?: string
}

// 重置密码参数 (IdReq)
export interface SchoolPasswordReq {
  id: string
  newPassword: string
}

// 更新状态参数 (StatusUpdateReq)
export interface SchoolStatusReq {
  id: string
  status: number
}

// --- API 方法定义 ---

// 1. 获取学校列表 (分页)
export function getSchoolList(params: SchoolQueryParams) {
  return request.get('/schoolMgr/list', { params })
}

// 2. 创建学校
export function createSchool(data: SchoolCreateReq) {
  return request.post('/schoolMgr/createSchool', data)
}

// 3. 更新学校信息
export function updateSchool(data: SchoolUpdateReq) {
  return request.post('/schoolMgr/updateSchool', data)
}

// 4. 重置学校管理员密码
export function resetSchoolPassword(data: SchoolPasswordReq) {
  return request.post('/schoolMgr/resetPassword', data)
}

// 5. 删除学校 (逻辑删除)
export function deleteSchool(id: string) {
  return request.delete(`/schoolMgr/delete/${id}`)
}

// 6. 更新学校状态 (启用/禁用)
export function updateSchoolStatus(data: SchoolStatusReq) {
  return request.post('/schoolMgr/updateStatus', data)
}

// 7. 获取回收站列表 (已删除的学校)
// 注意：后端接口 deletedList 似乎没有定义分页参数，这里按无参请求
export function getDeletedSchoolList() {
  return request.get('/schoolMgr/deletedList')
}

// 8. 恢复学校
export function restoreSchool(id: string) {
  return request.post(`/schoolMgr/restore/${id}`)
}
