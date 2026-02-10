import request from '@/utils/request'

// --- 类型定义 ---

// 学校排行项
export interface SchoolRankItem {
  schoolId: string
  schoolName: string
  studentCount: number
}

// 创业领域分布项
export interface DomainDistributionItem {
  domain: string
  domainLabel: string
  count: number
}

// 最新企业项
export interface LatestCompanyItem {
  companyId: string
  companyName: string
  industry: string
  jobCount: number
  createTime: string
}

// 首页概览数据
export interface HomeOverviewData {
  schoolCount: number
  companyCount: number
  studentCount: number
  teacherCount: number
  pendingJobs: number
  pendingProjects: number
  schoolRank: SchoolRankItem[]
  domainDistribution: DomainDistributionItem[]
  latestCompanies: LatestCompanyItem[]
}

// --- API 方法 ---

/**
 * 获取管理员首页概览数据
 */
export function getHomeOverview() {
  return request.get<any, { data: HomeOverviewData }>('/home/overview')
}
