import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/dtpay";


export function listAgentReport(query) {
  return request({
    url: '/dt/report/agentReport',
    method: 'get',
    params: query
  })
}

export function listMerchantReport(query) {
  return request({
    url: '/dt/report/merchantReport',
    method: 'get',
    params: query
  })
}