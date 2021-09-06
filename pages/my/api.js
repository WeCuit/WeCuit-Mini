import request from '../../utils/request';

// OCR验证码识别
export const captchaOCR = (verify, data) => {
  return request.post("/Tool/captchaDecodeV2", data, {
    header: {
      'x-verify': verify
    }
  })
}

// 获取SSO页面验证码
export const getSSOCaptcha = (cookie) => {
  return request.get("https://sso.cuit.edu.cn/authserver/captcha", null, {
    responseType: "arraybuffer",
    header: {
      cookie
    }
  })
}

// SSO登录检查
export const checkSSOLogin = (cookie) => {
  return request.get("https://sso.cuit.edu.cn/authserver/login", null, {
    header: {
      cookie
    }
  })
}

// SSO退出登录
export const ssoLogout = (cookie) => {
  return request.get("https://sso.cuit.edu.cn/authserver/logout", null, {
    header: {
      cookie
    }
  })
}

// 教务管理登录
export const jwglLogin = (cookie) => {
  return request.post("/Jwgl/login", {
    cookie
  })
}
// 教务管理登录检查
export const jwglLoginCheck = (cookie) => {
  return request.post("/Jwgl/loginCheck", {
    cookie
  })
}

// WEBVPN登录
export const WV_login = (cookie, data) => {
  return request.post("https://webvpn.cuit.edu.cn/por/login_psw.csp?anti_replay=1&encrypt=1&apiversion=1", data, {
    header: {
      "content-type": "application/x-www-form-urlencoded",
      cookie
    }
  })
}

// WEBVPN登录准备
export const WV_loginAuth = (cookie) => {
  return request.get("https://webvpn.cuit.edu.cn/por/login_auth.csp?apiversion=1", null, {
    header: {
      cookie,
    }
  })
}

// WEBVPN登录检查
export const WV_loginCheck = (cookie)=>{
  return request.get("https://webvpn.cuit.edu.cn/por/svpnSetting.csp?apiversion=1", null, {
    header: {
      cookie
  },
  })
}