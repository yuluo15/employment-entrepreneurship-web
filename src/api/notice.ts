import request from '@/utils/request'

// --- 类型定义 ---

// 查询参数
export interface NoticeQuery {
  pageNum: number
  pageSize: number
  noticeTitle?: string
  noticeType?: string | null
  status?: number | null
}

// 公告列表项
export interface NoticeItem {
  noticeId: string
  noticeTitle: string
  noticeType: string  // 1:通知, 2:公告, 3:政策, 4:新闻
  noticeContent: string
  status: number  // 0:草稿, 1:已发布
  isTop: number  // 0:否, 1:是
  viewCount: number
  createBy: string
  createTime: string
  updateTime: string
  publishTime?: string
  publisherType?: string  // 'admin' 或 'school'
  publisherId?: string
  targetAudience?: string  // 'all' 或 'student'
}

// 新增/编辑表单
export interface NoticeForm {
  noticeId?: string
  noticeTitle: string
  noticeType: string
  noticeContent: string
  isTop: number
  status?: number  // 0:草稿, 1:已发布
  targetAudience?: string  // 'all' 或 'student'
}

// --- API 方法 ---

/**
 * 获取公告列表
 */
export function getNoticeList(params: NoticeQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof NoticeQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof NoticeQuery]
    }
  })
  return request.get<any, { data: { data: NoticeItem[], total: number } }>('/notice/list', { params: cleanParams })
}

/**
 * 新增公告
 */
export function addNotice(data: NoticeForm) {
  return request.post('/notice/add', data)
}

/**
 * 更新公告
 */
export function updateNotice(data: NoticeForm) {
  return request.put('/notice/update', data)
}

/**
 * 删除公告
 */
export function deleteNotice(noticeId: string) {
  return request.delete(`/notice/delete/${noticeId}`)
}

/**
 * 发布公告
 */
export function publishNotice(noticeId: string) {
  return request.put(`/notice/publish/${noticeId}`)
}

/**
 * 停用公告
 */
export function unpublishNotice(noticeId: string) {
  return request.put(`/notice/unpublish/${noticeId}`)
}

/**
 * 置顶/取消置顶
 */
export function toggleTopNotice(noticeId: string, isTop: number) {
  return request.put(`/notice/top/${noticeId}`, { isTop })
}
