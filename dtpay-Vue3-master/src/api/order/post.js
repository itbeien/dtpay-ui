import request from '@/utils/request'

// 查询订单列表
export function listPost(query) {
  return request({
    url: '/dt/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单
export function getPost(orderId) {
  return request({
    url: '/dt/order/' + orderId,
    method: 'get'
  })
}

// 新增
export function addPost(data) {
  return request({
    url: '/dt/order',
    method: 'post',
    data: data
  })
}

// 修改订单
export function updatePost(data) {
  return request({
    url: '/dt/order',
    method: 'put',
    data: data
  })
}

// 删除订单
export function delPost(orderId) {
  return request({
    url: '/dt/order/' + orderId,
    method: 'delete'
  })
}
