import request from '@/utils/request'

// 1. 定义后端统一返回结构 (对应 Java 的 Result<T>)
export interface ApiResult<T> {
    message: string
    code?: number // 如果你后端Result里有code就加，没有就不加，看你拦截器逻辑似乎是靠message或code判断
    data: T
}

// 2. 登录参数
export interface LoginParams {
    loginName: string
    password: string
}

// 3. 登录成功后的有效载荷 (T)
export interface LoginResult {
    userId: string
    loginName: string
    showName: string
    role: string
    token: string
}

// [新增] 修改密码参数接口
export interface PasswordReq {
    userId: string
    oldPassword: string
    newPassword: string
}

// [新增] 修改密码 API
export function changePassword(data: PasswordReq) {
    return request.post('/auth/changePassword', data)
}

// 4. 修改接口定义：返回值包裹在 ApiResult 中
export function loginApi(data: LoginParams) {
    // 注意这里：Promise<ApiResult<LoginResult>>
    return request.post<any, ApiResult<LoginResult>>('/auth/login', data)
}

export function logoutApi(userId: string) {
    return request.get('/auth/logout', {
        params: { userId: userId }
    })
}

export function registerCompanyApi(data: any) {
    return request.post('/auth/register/company', data)
}

// 发送邮箱验证码
export function sendEmailCodeApi(email: string) {
    return request.post('/api/sendEmail/code', { email })
}