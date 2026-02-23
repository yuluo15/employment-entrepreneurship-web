import request from '@/utils/request'

export interface MessageQuery {
  pageNum: number
  pageSize: number
  type?: number
  isRead?: number
}

export interface MessageItem {
  id: string
  title: string
  content: string
  type: number
  isRead: number
  refId: string | null
  createTime: string
  companyName?: string
  positionName?: string
}

export interface MessageDetail extends MessageItem {
  positionId?: string
  applicationId?: string
}

export interface UnreadCountResponse {
  total: number
  systemCount: number
  interviewCount: number
  offerCount: number
}

export interface ReadAllRequest {
  type?: number
}

// 获取消息列表
export const getMessages = (params: MessageQuery) => {
  return request<{ total: number; data: MessageItem[] }>({
    url: '/mobile/messages',
    method: 'get',
    params
  })
}

// 获取消息详情
export const getMessageDetail = (id: string) => {
  return request<MessageDetail>({
    url: `/mobile/messages/${id}`,
    method: 'get'
  })
}

// 获取未读消息数量
export const getUnreadCount = () => {
  return request<UnreadCountResponse>({
    url: '/mobile/messages/unread-count',
    method: 'get'
  })
}

// 标记消息为已读
export const markAsRead = (id: string) => {
  return request({
    url: `/mobile/messages/${id}/read`,
    method: 'put'
  })
}

// 批量标记已读
export const markAllAsRead = (type?: number) => {
  return request({
    url: '/mobile/messages/read-all',
    method: 'put',
    data: { type }
  })
}

// 删除消息
export const deleteMessage = (id: string) => {
  return request({
    url: `/mobile/messages/${id}`,
    method: 'delete'
  })
}
