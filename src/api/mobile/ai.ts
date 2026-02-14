import request from '@/utils/request'

/**
 * AI推荐职位VO
 */
export interface JobRecommendationVO {
  jobId: string
  title: string
  companyName: string
  salaryRange: string
  location: string
  matchScore: number  // 匹配度（0-100）
  recommendReason: string  // 推荐理由
}

/**
 * 获取AI推荐职位
 * @param limit 推荐数量，默认10
 */
export function getAIRecommendJobs(limit: number = 10) {
  return request.get<any, { data: JobRecommendationVO[] }>(
    '/mobile/ai/recommend/jobs',
    { params: { limit } }
  )
}

/**
 * 刷新简历向量
 * 说明：简历更新后调用此接口重新生成向量
 */
export function refreshResumeEmbedding() {
  return request.post('/mobile/ai/refresh/resume')
}
