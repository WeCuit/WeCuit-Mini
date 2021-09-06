import request from "../../utils/request";
export const downFilePrepare = (data)=>request.post("/News/downFilePrepare", data)