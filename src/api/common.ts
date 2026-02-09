import request from '@/utils/request'

// 通用上传接口
export function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return request.post<any, string>('/common/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}