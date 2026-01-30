import request from '@/utils/request'

// --- 实体定义 ---
export interface CompanyEntity {
    id: string
    name: string
    code: string          // [新增] 统一社会信用代码
    logo: string
    contactPerson: string
    contactPhone: string
    email: string         // [新增] 企业邮箱
    industry: string
    scale: string
    description: string   // [新增] 企业简介
    licenseUrl: string
    status: number        // 0-待审核, 1-通过/正常, 2-驳回, 9-冻结
    auditReason?: string  // [新增] 对应数据库 audit_reason
    createTime: string
}

// 查询参数
export interface CompanyQuery {
    pageNum: number
    pageSize: number
    name?: string
    code?: string         // [新增] 支持按信用代码搜索
    contactPerson?: string
    status?: number | null // 状态筛选
}

// 新增参数 (CreateCompanyReq)
export interface CreateCompanyReq {
    name: string
    code: string
    email: string         // [核心] 必填，作为登录账号
    logo: string
    licenseUrl?: string
    industry: string
    scale: string
    contactPerson: string
    contactPhone: string
    address?: string
    description?: string
}

// ... 接口方法保持不变 ...
export function getCompanyList(params: CompanyQuery) {
    const cleanParams = { ...params }
    Object.keys(cleanParams).forEach(key => {
        const value = cleanParams[key as keyof CompanyQuery]
        if (value === null || value === undefined || value === '') {
            delete cleanParams[key as keyof CompanyQuery]
        }
    })
    return request.get('/companyMgr/list', { params: cleanParams })
}

export function createCompany(data: CreateCompanyReq) {
    return request.post('/companyMgr/create', data)
}

export function updateCompany(data: any) {
    return request.post('/companyMgr/update', data)
}

export function deleteCompany(id: string) {
    return request.delete(`/companyMgr/delete/${id}`)
}

export function updateCompanyStatus(data: { id: string, status: number }) {
    return request.post('/companyMgr/updateStatus', data)
}

export function auditCompany(data: { id: string, status: number, reason?: string }) {
    return request.post('/companyMgr/audit', data)
}