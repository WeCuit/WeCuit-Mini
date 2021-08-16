import request from '../../utils/request';

export const captchaOCR = (verify, data)=>{
  return request.post("/Tool/captchaDecodeV2", data, {
    header: {
      'x-verify': verify
    }
  })
}