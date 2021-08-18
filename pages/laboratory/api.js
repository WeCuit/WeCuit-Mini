import request from '../../utils/request'

// 获取实验课表首页数据
export const getLabAll = (param)=>{
  return request.get("/Jwc/labAll", {param});
}

// 获取实验表详情
export const getLabDetail = (param)=>{
  return request.get("/Jwc/labDetail", {param})
}