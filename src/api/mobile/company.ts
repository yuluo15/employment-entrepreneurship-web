import request from '@/utils/request'

export interface CompanyDetailVo {
    id: string
    name: string
    logo: string
    industry: string[]
    scale: string
    fundingStage: string
    website: string
    address: string
    description: string
    images: string[] | null // 可能为 null
    jobCount: number
}

export function getCompanyDetail(id: string) {
    return request.get(`/mobile/company/detail/${id}`)
}