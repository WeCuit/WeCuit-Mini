import request from '../../utils/request';

// OCR验证码识别
export const captchaOCR = (verify, data)=>{
  return request.post("/Tool/captchaDecodeV2", data, {
    header: {
      'x-verify': verify
    }
  })
}

// 获取SSO页面验证码
export const getSSOCaptcha = (cookie)=>{
  return request.get("https://sso.cuit.edu.cn/authserver/captcha", null, {
    responseType: "arraybuffer",
    header: {
      cookie
    }
  })
}

// SSO登录检查
export const checkSSOLogin = (cookie)=>{
  return request.get("https://sso.cuit.edu.cn/authserver/login", null, {
    header: {
      cookie
    }
  })
}

// 教务管理登录
export const jwglLogin = (cookie)=>{
  return request.post("/Jwgl/login", {
    cookie
  })
}