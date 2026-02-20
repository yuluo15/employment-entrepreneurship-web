import request from '@/utils/request'

// --- 类型定义 ---

// 投递查询参数
export interface DeliveryQuery {
  pageNum: number
  pageSize: number
  jobId?: string
  studentName?: string
  startDate?: string
  endDate?: string
}

// 投递列表项
export interface DeliveryItem {
  id: string
  studentId: string
  studentName: string
  studentPhone: string
  email: string
  jobId: string
  jobName: string
  resumeId: string
  education: string
  school: string
  major: string
  graduationYear: string
  deliveryTime: string
  gender: number
}

// 简历详情
export interface ResumeDetail extends DeliveryItem {
  resumeId: string
  expectedPosition?: string
  expectedSalary?: string
  targetCity?: string
  jobType?: number
  arrivalTime?: string
  skills?: string
  personalSummary?: string
  educationHistory?: Array<{
    school: string
    major: string
    degree: string
    startDate: string
    endDate: string
    description?: string
  }>
  internshipExp?: Array<{
    company: string
    role: string
    startDate: string
    endDate: string
    description: string
  }>
  projectExp?: Array<{
    projectName: string
    role: string
    startDate: string
    endDate: string
    description: string
    projectLink?: string
  }>
  certificates?: any[]
  resumeScore?: number
}
// export interface ResumeDetail extends DeliveryItem {
//   resumeId: string
//   jobIntention?: string
//   expectedSalary?: string
//   expectedCity?: string
//   skills?: string
//   selfEvaluation?: string
//   educationList?: Array<{
//     school: string
//     major: string
//     education: string
//     startDate: string
//     endDate: string
//   }>
//   experienceList?: Array<{
//     company: string
//     position: string
//     startDate: string
//     endDate: string
//     description: string
//   }>
// }

// 面试表单
export interface InterviewForm {
  deliveryId: string
  interviewTime: string
  duration: number
  type: number  // ONSITE/VIDEO/PHONE
  location: string
  notes?: string
}

// 职位选项
export interface JobOption {
  id: string
  jobName: string
}

// 面试查询参数
export interface InterviewQuery {
  pageNum: number
  pageSize: number
  studentName?: string
  status?: number
  startDate?: string
  endDate?: string
}

// 面试列表项
export interface InterviewItem {
  id: string
  deliveryId: string
  studentId: string
  studentName: string
  studentPhone: string
  jobId: string
  jobName: string
  interviewTime: string
  duration: number
  type: number  // ONSITE/VIDEO/PHONE
  location: string
  notes?: string
  status: number  // SCHEDULED/COMPLETED/CANCELLED
  interviewScore?: number
  interviewComment?: string
  interviewResult?: string  // PASS/FAIL
}

// 完成面试表单
export interface CompleteForm {
  interviewId: string
  result: string  // PASS/FAIL
  score: number
  comment: string
}

// 评价表单
export interface EvaluateForm {
  interviewId: string
  score: number
  comment: string
}

// 人才库查询参数
export interface TalentQuery {
  pageNum: number
  pageSize: number
  studentName?: string
  status?: string  // OFFER/REJECTED
  jobId?: string
}

// 人才库列表项
export interface TalentItem {
  id: string
  studentId: string
  studentName: string
  studentPhone: string
  email: string
  jobId: string
  jobName: string
  resumeId: string
  school: string
  major: string
  education: string
  graduationYear: string
  status: string  // OFFER/REJECTED
  updateTime: string
  gender: number
}

// 人才库统计
export interface TalentStatistics {
  offerCount: number
  rejectedCount: number
  totalCount: number
}

// 发放Offer表单
export interface OfferForm {
  deliveryId: string
  entryDate: string
  salary: string
  notes?: string
}

// --- API 方法 ---

/**
 * 获取投递简历列表
 */
export function getDeliveryList(params: DeliveryQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof DeliveryQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof DeliveryQuery]
    }
  })
  return request.get<any, { data: { data: DeliveryItem[], total: number } }>('/company/delivery/list', { params: cleanParams })
}

/**
 * 获取简历详情
 */
export function getResumeDetail(resumeId: string) {
  return request.get<any, { data: ResumeDetail }>(`/company/resume/detail/${resumeId}`)
}

/**
 * 安排面试
 */
export function arrangeInterview(data: InterviewForm) {
  return request.post('/company/interview/arrange', data)
}

/**
 * 拒绝简历
 */
export function rejectDelivery(deliveryId: string, reason?: string) {
  return request.post('/company/delivery/reject', { deliveryId, reason })
}

/**
 * 获取公司职位选项（用于筛选）
 */
export function getCompanyJobs() {
  return request.get<any, { data: JobOption[] }>('/company/job/options')
}

/**
 * 获取面试列表
 */
export function getInterviewList(params: InterviewQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof InterviewQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof InterviewQuery]
    }
  })
  return request.get<any, { data: { data: InterviewItem[], total: number } }>('/company/interview/list', { params: cleanParams })
}

/**
 * 完成面试
 */
export function completeInterview(data: CompleteForm) {
  return request.post('/company/interview/complete', data)
}

/**
 * 取消面试
 */
export function cancelInterview(interviewId: string, reason: string) {
  return request.post('/company/interview/cancel', { interviewId, reason })
}

/**
 * 评价面试
 */
export function evaluateInterview(data: EvaluateForm) {
  return request.post('/company/interview/evaluate', data)
}

/**
 * 获取人才库列表
 */
export function getTalentPoolList(params: TalentQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof TalentQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof TalentQuery]
    }
  })
  return request.get<any, { data: { data: TalentItem[], total: number } }>('/company/talent/list', { params: cleanParams })
}

/**
 * 获取人才库统计
 */
export function getTalentStatistics() {
  return request.get<any, { data: TalentStatistics }>('/company/talent/statistics')
}

/**
 * 发放Offer
 */
export function sendOffer(data: OfferForm) {
  return request.post('/company/offer/send', data)
}

/**
 * 从面试发放Offer
 */
export function sendOfferFromInterview(data: OfferForm) {
  return request.post('/company/interview/offer', data)
}

/**
 * 归档候选人（面试不通过）
 */
export function archiveCandidate(deliveryId: string) {
  return request.post('/company/interview/archive', { deliveryId })
}
