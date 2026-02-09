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

// [新增] 个人详细信息 VO (对应 MyProfileVo)
export interface MyProfileVo {
    id: string
    username: string
    realName: string
    schoolName: string
    major: string

    avatar: string
    gender: number // 0:未知, 1:男, 2:女
    phone: string
    email: string
    graduationYear: string
    education: string
}

// [新增] 更新请求参数 (对应 ProfileUpdateReq)
export interface ProfileUpdateReq {
    avatar: string
    gender: number
    phone: string
    email: string
    graduationYear: string
}

// 获取个人中心聚合数据
export function getProfileSummary() {
    return request.get<any, StudentProfileVo>('/mobile/student/profile/summary')
}

// 2. [新增] 获取个人详细信息 (回显)
export function getProfileDetail() {
    return request.get<any, MyProfileVo>('/mobile/student/profile/detail')
}

// 3. [新增] 更新个人信息
export function updateProfile(data: ProfileUpdateReq) {
    return request.post('/mobile/student/profile/update', data)
}