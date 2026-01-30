import request from '@/utils/request'

export interface ProjectDetailVo {
    projectId: string
    title: string
    logo: string
    slogan: string
    status: string
    tags: string[]
    schoolName: string
    leaderName: string
    mentorName: string
    teamSize: number
    description: string
    needs: string
}

export function getProjectDetail(id: string) {
    return request.get(`/mobile/project/detail/${id}`)
}