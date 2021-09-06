import request from '../../utils/request'
export const getCaptcha = (data)=>request.post("/Jszx/office_getCaptcha", data)

export const officeQuery = (data)=>request.post('/Jszx/office_query', data)