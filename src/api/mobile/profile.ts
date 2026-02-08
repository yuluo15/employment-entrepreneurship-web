import request from '@/utils/request'

export interface StudentProfileVo {
    name: string
    avatar: string
    schoolName: string
    major: string
    graduationYear: number

    deliveredCount: number
    interviewCount: number
    collectionCount: number
    viewCount: number

    resumeComplete: number
    resumeId: string | null

    projectCount: number
}

// 获取个人中心聚合数据
export function getProfileSummary() {
    return request.get<any, StudentProfileVo>('/mobile/student/profile/summary')
}