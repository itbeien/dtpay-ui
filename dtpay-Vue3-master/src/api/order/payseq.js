import request from '@/utils/request'

// 查询订单流水列表
export function listPost(query) {
  return request({
    url: '/dt/payseq/list',
    method: 'get',
    params: query
  })
}

// 查询订单
export function getPost(tradeSeq) {
  return request({
    url: '/dt/payseq/' + tradeSeq,
    method: 'get'
  })
}

// 新增
export function addPost(data) {
  return request({
    url: '/dt/payseq',
    method: 'post',
    data: data
  })
}

// 修改订单
export function updatePost(data) {
  return request({
    url: '/dt/payseq',
    method: 'put',
    data: data
  })
}

// 删除订单
export function delPost(tradeSeq) {
  return request({
    url: '/dt/payseq/' + tradeSeq,
    method: 'delete'
  })
}


// 订单退款
export function refunOrder(data) {
  return request({
    url: '/dt/order/refund/',
    method: 'post',
    data: data
  })
}

export function payQuery(data){
  return request({
    url: '/dt/payseq/payQuery/',
    method: 'post',
    data: data
  })
}