import request from '@/utils/request'

// 1. 收藏请求参数
export interface CollectionReq {
    targetId: string
    type: 'JOB' | 'PROJECT'
}

// 2. 投递请求参数
export interface ApplyJobReq {
    jobId: string // 注意：你后端定义的是大写 JobId
}

// [新增] 投递记录 VO
export interface StudentDeliveryVo {
    id: string
    jobId: string
    jobName: string
    salary: string
    companyId: string
    companyName: string
    companyLogo: string
    status: string
    statusText: string
    createTime: string
}

// [新增] 获取投递列表
export function getMyDeliveryList(params: { pageNum: number; pageSize: number; status?: string }) {
    return request.get('/mobile/interaction/delivery/list', { params })
}

// [新增] 获取收藏列表 (返回结构 PageResult<SearchResultVo>)
export function getMyCollectionList(params: { pageNum: number; pageSize: number; type?: string }) {
    return request.get('/mobile/interaction/collection/list', { params })
}

// --- API 方法 ---

/**
 * 切换收藏状态
 * @returns boolean true=已收藏, false=已取消
 */
export function toggleCollection(data: CollectionReq) {
    return request.post<any, boolean>('/mobile/interaction/collection/toggle', data)
}

/**
 * 投递简历
 * @returns boolean true=投递成功
 */
export function applyJob(data: ApplyJobReq) {
    return request.post<any, boolean>('/mobile/interaction/apply/job', data)
}