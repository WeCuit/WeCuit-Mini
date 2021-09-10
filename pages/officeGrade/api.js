import request from '../../utils/request'

export const getOfficePrepare = ()=>request.get("/Jszx/office_prepare")
export const getOfficeCaptcha = (data)=>request.get("/Jszx/office_getCaptcha", data)

export const officeQuery = (data)=>request.get('/Jszx/office_query', data)