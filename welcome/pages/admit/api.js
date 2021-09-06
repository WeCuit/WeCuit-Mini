import request from '../../../utils/request'

// 查询
export const queryAdmit = (ksh, sfz)=>{
  return request.post("/Admit/query", {ksh, sfz})
}