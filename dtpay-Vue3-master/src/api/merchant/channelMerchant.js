import request from '@/utils/request'

// 查询渠道商户列表
export function listPost(query) {
  return request({
    url: '/dt/channelMerchant/list',
    method: 'get',
    params: query
  })
}

// 查询渠道商户详细信息
export function getPost(id) {
  return request({
    url: '/dt/channelMerchant/' + id,
    method: 'get'
  })
}

// 新增商户
export function addPost(data) {
  return request({
    url: '/dt/channelMerchant',
    method: 'post',
    data: data
  })
}

// 修改渠道商户
export function updatePost(data) {
  return request({
    url: '/dt/channelMerchant',
    method: 'put',
    data: data
  })
}

// 删除渠道商户
export function delPost(id) {
  return request({
    url: '/dt/channelMerchant/' + id,
    method: 'delete'
  })
}