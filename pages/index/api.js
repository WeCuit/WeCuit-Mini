import request from '../../utils/request'

// 获取配置
export const getConfig = ()=>{
  return request.get("/Sys/getConfig")
}