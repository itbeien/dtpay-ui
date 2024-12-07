import request from '@/utils/request'

// 查询商户列表
export function listPost(query) {
  return request({
    url: '/dt/merchant/list',
    method: 'get',
    params: query
  })
}

// 查询商户详细
export function getPost(mercNo) {
  return request({
    url: '/dt/merchant/' + mercNo,
    method: 'get'
  })
}

// 新增商户
export function addPost(data) {
  return request({
    url: '/dt/merchant',
    method: 'post',
    data: data
  })
}

// 修改商户
export function updatePost(data) {
  return request({
    url: '/dt/merchant',
    method: 'put',
    data: data
  })
}

// 删除岗位
export function delPost(mercNos) {
  return request({
    url: '/dt/merchant/' + mercNos,
    method: 'delete'
  })
}