import request from '@/utils/request'

// 查询二维码商户列表
export function listPost(query) {
  return request({
    url: '/dt/device/list',
    method: 'get',
    params: query
  })
}

// 查询二维码商户详细信息
export function getPost(id) {
  return request({
    url: '/dt/device/' + id,
    method: 'get'
  })
}

// 新增二维码商户绑定
export function addPost(data) {
  return request({
    url: '/dt/device',
    method: 'post',
    data: data
  })
}

// 修改二维码商户信息
export function updatePost(data) {
  return request({
    url: '/dt/device',
    method: 'put',
    data: data
  })
}

// 删除二维码商户绑定关系
export function delPost(id) {
  return request({
    url: '/dt/device/' + id,
    method: 'delete'
  })
}