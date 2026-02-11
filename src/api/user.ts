import request from '@/utils/request'

// --- 类型定义 ---

// 用户信息
export interface UserInfo {
  id: string
  loginIdentity: string
  email?: string
  phone?: string
  nickname?: string
  realName?: string
  avatar?: string
  gender?: number  // 0=未知, 1=男, 2=女
  roleKey: string
  ownerId?: string
  status: number  // 0=禁用, 1=正常
  createTime: string
  loginDate?: string
}

// 更新用户信息请求
export interface UpdateUserInfoReq {
  id: string
  email?: string
  phone?: string
  nickname?: string
  realName?: string
  avatar?: string
  gender?: number
}

// 修改密码请求
export interface ChangePasswordReq {
  userId: string
  oldPassword: string
  newPassword: string
}

// --- API 方法 ---

/**
 * 获取当前用户信息
 */
export function getUserInfo() {
  return request.get<any, { data: UserInfo }>('/user/info')
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: UpdateUserInfoReq) {
  return request.put('/user/update', data)
}

/**
 * 修改密码
 */
export function changePassword(data: ChangePasswordReq) {
  return request.post('/user/changePassword', data)
}
