import request from '../../../../utils/request'

// 获取辅导员列表
export const getCounselorList = (college)=>{
  return request.get("/college/getCounselorList/college/" + college)
}