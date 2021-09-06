import request from '../../utils/request'

// 获取课表选项
export const getCourseOption = (cookie)=>{
  return request.post("/Jwgl/getCourseOption/", {cookie})
}

// 获取课表
export const getCourseTable = (cookie, courseType, semester)=>{
  return request.post('/Jwgl/getCourseTableV2/', {cookie, courseType, semester})
}