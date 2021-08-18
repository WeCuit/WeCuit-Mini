import request from '../../utils/request'

// 获取成绩
export const getGradeTable = (cookie)=>{
  return request.post("/Jwgl/getGradeTableV2/", {cookie})
}