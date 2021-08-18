import request from '../../utils/request'

// 获取考试选项
export const getExamOption = (cookie)=>{
  return request.post("/Jwgl/getExamOption/", {cookie})
}

// 获取考试安排
export const getExamTable = (cookie, batchId)=>{
  return request.post("/Jwgl/getExamTable/", {cookie, batchId})
}