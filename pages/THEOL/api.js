import request from "../../utils/request";

export const getCourseList = (cookie)=>request.post('/Theol/courseList', {cookie})
export const theolLogin = (data)=>request.post('/Theol/login', data)