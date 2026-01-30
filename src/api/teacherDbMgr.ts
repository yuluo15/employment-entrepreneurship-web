import request from '@/utils/request'

// --- 类型定义 ---

export interface SchoolNameVo {
    id: string
    schoolName: string
}

export interface DictDataVo {
    id: string
    dictSort: number
    dictLabel: string
    dictValue: string
}

export interface TeacherEntity {
    teacherId: string
    userId: string
    schoolId: string
    name: string
    employeeNo: string
    gender: string
    collegeName: string
    title: string       // 存的是字典 Value，如 'PROFESSOR'
    expertise: string
    intro: string
    guidanceCount: number
    ratingScore: number
    phone: string
    email: string
    createTime: string
}

// 对应后端 TeacherQuery
export interface TeacherQueryReq {
    pageNum: number
    pageSize: number
    schoolId?: string
    name?: string
    collegeName?: string
    title?: string
}

// --- API 方法 ---

// 1. 获取学校列表
export function getSchoolNameList() {
    return request.get('/teacherDbMgr/schoolList')
}

// 2. 获取教师列表 (注意：后端路径目前是 /studentList)
export function getTeacherList(params: TeacherQueryReq) {
    // 清理空参数
    const cleanParams = { ...params }
    Object.keys(cleanParams).forEach(key => {
        if (cleanParams[key] === '' || cleanParams[key] === null || cleanParams[key] === undefined) {
            delete cleanParams[key]
        }
    })
    return request.get('/teacherDbMgr/teacherList', { params: cleanParams })
}

// 3. 获取字典数据
export function getDictData(dictType: string) {
    return request.get('/teacherDbMgr/getDictData', {
        params: { dictType }
    })
}

// 4. 导出 Excel (GET请求)
export function exportTeacher(schoolId?: string) {
    return request.post(
        '/teacherDbMgr/export',
        null,
        {
            params: { schoolId },
            responseType: 'blob' // 必须声明返回二进制流
        }
    )
}