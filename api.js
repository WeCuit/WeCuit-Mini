import request from './utils/request'

// 获取用户信息
export const getUserInfo = (code)=>{
  return request.get("/Sys/getUserInfoV2", { code })
}

// 获取一卡通信息
export const getAccWallet = (AccNum)=>{
  return request.post("/Card/getAccWallet", {AccNum})
}