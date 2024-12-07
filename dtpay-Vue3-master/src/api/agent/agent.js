import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/dtpay";


export function listAgent(query) {
  return request({
    url: '/dt/agent/list',
    method: 'get',
    params: query
  })
}

// 查询支付渠道详细信息
export function getAgent(id) {
  return request({
    url: '/dt/agent/' + id,
    method: 'get'
  })
}

// 用户头像上传
export function uploadImg(data) {
  return request({
    url: '/dt/agent/upload',
    method: 'post',
    headers: {  
      "Content-Type": "multipart/form-data",  
    }, 
    data:data
  })
}

// 新增代理商
export function addAgent(data) {
  return request({
    url: '/dt/agent',
    method: 'post',
    data: data
  })
}

// 删除代理商
export function delAgent(id) {
  return request({
    url: '/dt/agent/' + id,
    method: 'delete'
  })
}
//获取省份数据
export function ylArea(query) {
  return request({
    url: '/dt/area/ylArea',
    method: 'get',
    params: query
  })
}

// 修改代理商 
export function updateAgent(data) {
  return request({
    url: '/dt/agent',
    method: 'put',
    data: data
  })
}

//获取上级代理商数据
export function parentAgent(query) {
  return request({
    url: '/dt/agent/parentAgent',
    method: 'get',
    params: query
  })
}