import request from '@/utils/request'

/**
 * 简历匹配VO
 */
export interface ResumeMatchVO {
  resumeId: string
  studentId: string
  studentName: string
  school: string
  major: string
  education: string
  graduationYear: number
  expectedPosition: string
  expectedSalary: string
  targetCity: string
  skills: string
  matchScore: number  // 匹配度（0-100）
  matchReason: string  // 匹配理由
  phone: string
  email: string
}

/**
 * AI筛选简历
 * @param jobId 职位ID
 * @param limit 返回数量，默认20
 */
export function screenResumes(jobId: string, limit: number = 20) {
  return request.get<any, { data: ResumeMatchVO[] }>(
    '/company/ai/screen/resumes',
    { params: { jobId, limit } }
  )
}
