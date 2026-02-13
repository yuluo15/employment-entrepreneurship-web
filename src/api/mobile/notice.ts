import request from '@/utils/request'

// 获取首页通知公告列表（最新5条）
export function getHomeNotices() {
  return request.get('/mobile/home/notices')
}

// 获取通知公告详情
export function getNoticeDetail(noticeId: string) {
  return request.get(`/mobile/notice/${noticeId}`)
}

// 获取通知公告列表（完整列表）
export function getNoticeList(params: {
  pageNum: number
  pageSize: number
  noticeType?: string
  publisherType?: string
}) {
  return request.get('/mobile/notices', { params })
}
