import request from '@/utils/request'

// --- 类型定义 ---

// 岗位查询参数
export interface JobQuery {
  pageNum: number
  pageSize: number
  jobName?: string
  companyName?: string
  audit?: number | null  // 0=待审核, 1=已通过, 2=已驳回
}

// 岗位列表项
export interface JobItem {
  jobId: string
  jobName: string
  salaryRange: string  // 字典值
  salaryRangeLabel: string  // 字典标签
  companyId: string
  companyName: string
  companyLogo: string
  companyIndustry: string
  city: string
  location: string  // 详细地址
  education: string  // 字典值
  educationLabel: string  // 字典标签
  experience: string
  tags: string  // 逗号分隔的字符串
  description: string
  requirement: string
  audit: number  // 0=待审核, 1=已通过, 2=已驳回
  viewCount: number
  hrId: string
  hrName: string
  contactPhone: string
  reason?: string  // 驳回原因
  createTime: string
}

// 审核参数
export interface AuditJobReq {
  jobId: string
  audit: number  // 1=通过, 2=驳回
  reason?: string  // 驳回原因
}

// --- API 方法 ---

/**
 * 获取岗位列表
 */
export function getJobList(params: JobQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof JobQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof JobQuery]
    }
  })
  return request.get('/jobAudit/list', { params: cleanParams })
}

/**
 * 审核岗位
 */
export function auditJob(data: AuditJobReq) {
  return request.post('/jobAudit/audit', data)
}

/**
 * 下架岗位
 */
export function offlineJob(jobId: string) {
  return request.post(`/jobAudit/offline/${jobId}`)
}
