import request from '@/utils/request'

// 查询支付渠道列表
export function listPost(query) {
  return request({
    url: '/dt/channel/list',
    method: 'get',
    params: query
  })
}

// 查询支付渠道详细信息
export function getPost(channelCode) {
  return request({
    url: '/dt/channel/' + channelCode,
    method: 'get'
  })
}

// 新增支付渠道
export function addPost(data) {
  return request({
    url: '/dt/channel',
    method: 'post',
    data: data
  })
}

// 修改支付渠道 
export function updatePost(data) {
  return request({
    url: '/dt/channel',
    method: 'put',
    data: data
  })
}

// 删除支付渠道
export function delPost(channelCode) {
  return request({
    url: '/dt/channel/' + channelCode,
    method: 'delete'
  })
}