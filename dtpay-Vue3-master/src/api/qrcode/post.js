import request from '@/utils/request'

// 查询二维码列表
export function listPost(query) {
  return request({
    url: '/dt/qrcode/list',
    method: 'get',
    params: query
  })
}

// 查询二维码详细信息
export function getPost(id) {
  return request({
    url: '/dt/qrcode/' + id,
    method: 'get'
  })
}
// 划拨二维码
export function postAllocationQR(data){
  return request({
    url: '/dt/qrcode/allocationQR',
    method: 'post',
    data: data
  })
}

// 新增二维码
export function addPost(data) {
  return request({
    url: '/dt/qrcode',
    method: 'post',
    data: data
  })
}

// 修改二维码
export function updatePost(data) {
  return request({
    url: '/dt/qrcode',
    method: 'put',
    data: data
  })
}

// 删除二维码
export function delPost(qrId) {
  return request({
    url: '/dt/qrcode/' + qrId,
    method: 'delete'
  })
}