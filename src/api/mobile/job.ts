import request from '@/utils/request'

export interface SearchResultVo {
    type: 'JOB' | 'COMPANY' | 'PROJECT'
    id: string
    title: string
    subTitle: string
    avatar: string
    nickName: string
    location: string
    highlight: string
    tags: string[]
    targetId: string
    ownerId: string
}

export interface SearchReq {
    pageNum: number
    pageSize: number
    keyword: string
    type: 'JOB' | 'COMPANY' | 'PROJECT'
}

// [新增] 职位详情 VO
export interface JobDetailVo {
    id: string
    title: string
    salaryRange: string
    tags: string[]
    city: string
    experience: string
    education: string
    description: string
    address: string
    createTime: string
    companyId: string
    companyName: string
    companyLogo: string
    companyScale: string
    companyIndustry: string // 可能逗号分隔
    hrId: string
    hrName: string
    hrTitle: string
    hrAvatar: string
    // [新增] 状态字段
    isCollected?: boolean
    isApplied?: boolean
}

// 搜索接口
export function searchApi(params: SearchReq) {
    return request.get('/mobile/job/search', { params })
}

// [新增] 职位详情接口
export function getJobDetail(id: string) {
    return request.get(`/mobile/job/detail/${id}`)
}