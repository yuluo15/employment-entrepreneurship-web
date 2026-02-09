import request from '@/utils/request'

// --- 对应后端 StudentResumeEntity 的内部类 ---
export interface EducationItem {
    school: string
    major: string
    degree: string
    startDate: string
    endDate: string
    description?: string
}

export interface InternshipItem {
    company: string
    role: string
    startDate: string
    endDate: string
    description?: string
}

export interface ProjectItem {
    projectName: string
    role: string
    startDate: string
    endDate: string
    description?: string
    projectLink?: string
}

// --- 简历主实体 ---
export interface StudentResumeVo {
    resumeId: string
    studentId: string
    // 求职意向 & 基础
    expectedPosition: string
    expectedSalary: string
    targetCity: string
    jobType: number // 1全职 2实习 (假设)
    arrivalTime: string
    skills: string
    personalSummary: string

    // 列表数据
    educationHistory: EducationItem[]
    internshipExp: InternshipItem[]
    projectExp: ProjectItem[]

    // 元数据
    resumeScore: number
    updateTime: string
}

// 1. 获取简历详情
export function getResumeDetail() {
    return request.get<any, StudentResumeVo>('/student/resume/detail')
}

// 2. 保存简历 (注意：后端是全量更新，所以我们要把整个对象传回去，或者至少传修改的字段)
export function saveResume(data: Partial<StudentResumeVo>) {
    return request.post('/student/resume/save', data)
}