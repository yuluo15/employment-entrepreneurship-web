import request from '@/utils/request'

// --- 类型定义 ---

// KPI数据
export interface KpiData {
  totalGraduates: number
  employedCount: number
  employmentRate: string
  entrepreneurshipCount: number
  entrepreneurshipRate: string
  avgSalary: string
}

// 学校排行
export interface SchoolRankItem {
  schoolId: string
  schoolName: string
  totalStudents: number
  employedStudents: number
  employmentRate: number
}

// 就业状态
export interface EmploymentStatusItem {
  statusName: string
  count: number
  percentage: string
}

// 薪资分布
export interface SalaryDistributionItem {
  range: string
  count: number
}

// 热门行业
export interface HotIndustryItem {
  industry: string
  count: number
}

// 创业项目统计
export interface EntrepreneurshipData {
  totalProjects: number
  approvedProjects: number
  pendingProjects: number
  domainDistribution: Array<{
    domain: string
    count: number
  }>
}

// 概览数据
export interface EmploymentOverviewData {
  kpi: KpiData
  schoolRank: SchoolRankItem[]
  employmentStatus: EmploymentStatusItem[]
  salaryDistribution: SalaryDistributionItem[]
  hotIndustries: HotIndustryItem[]
  entrepreneurship: EntrepreneurshipData
}

// --- API 方法 ---

/**
 * 获取就业统计概览数据
 * @param graduationYear 毕业年份，可选
 */
export function getEmploymentOverview(graduationYear?: number) {
  return request.get<any, { data: EmploymentOverviewData }>('/employment/stats/overview', {
    params: { graduationYear }
  })
}
