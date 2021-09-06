import request from '../../utils/request'

// 获取配置
export const getConfig = ()=>{
  return request.get("/Sys/getConfig")
}

// 获取余额
export const getAccWallet = (AccNum)=>{
  return request.post("/Card/getAccWallet", {AccNum})
}