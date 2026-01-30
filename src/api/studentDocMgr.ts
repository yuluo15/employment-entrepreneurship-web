import request from '@/utils/request'

// --- 类型定义 ---

export interface SchoolNameVo {
    id: string
    schoolName: string
}

// [新增] 字典数据 Vo
export interface DictDataVo {
    id: string
    dictSort: number
    dictLabel: string
    dictValue: string
}

export interface StudentEntity {
    studentId: string
    userId: string
    schoolId: string
    studentName: string
    studentNo: string
    gender: number
    collegeName: string
    majorName: string
    className: string
    education: string
    enrollmentYear: number
    graduationYear: number
    phone: string
    email: string
    employmentStatus: number // 数据库存的是 Int
    createTime: string
}

export interface StudentQueryReq {
    pageNum: number
    pageSize: number
    schoolId?: string
    studentName?: string
    majorName?: string
    graduationYear?: number | string
    employmentStatus?: number | string
}

// --- API 方法 ---

// 1. 获取学校列表
export function getSchoolNameList() {
    return request.get('/studentDocMgr/schoolList')
}

// 2. 获取学生列表
export function getStudentList(params: StudentQueryReq) {
    const cleanParams = { ...params }
    Object.keys(cleanParams).forEach(key => {
        if (cleanParams[key] === '' || cleanParams[key] === null || cleanParams[key] === undefined) {
            delete cleanParams[key]
        }
    })
    return request.get('/studentDocMgr/studentList', { params: cleanParams })
}

// 3. [新增] 根据字典类型获取字典数据 (用于下拉框)
export function getDictData(dictType: string) {
    return request.get('/studentDocMgr/getDictData', {
        params: { dictType }
    })
}

// 4. 导出 Excel
export function exportStudent(schoolId?: string) {
    return request.post(
        '/studentDocMgr/export',
        null,
        {
            params: { schoolId },
            responseType: 'blob'
        }
    )
}