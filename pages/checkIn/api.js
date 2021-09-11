import request from '../../utils/request'

// 获取打卡列表
export const getCheckInList = (cookie)=>request.post('/Jszx/getCheckInListV2',{ cookie })
// 获取打卡数据
export const getCheckInData = (cookie, link)=>request.post('/Jszx/getCheckInEditV2/', {cookie, link})
// 提交打卡数据
export const postCheckInData = (link, JSZXCookie, form)=>request.post('/Jszx/doCheckInV3/', {link, JSZXCookie, form})