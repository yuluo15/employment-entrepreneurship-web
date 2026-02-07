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