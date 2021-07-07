import wx_rsa, {UTIL} from './rsa/wx_rsa'
import {QUERY_SALT} from '../config'

/**
 * 
 * @param {*} path /??/???/
 */
function genQuerySign(path, openid, str_data = ''){
    if("string" !== typeof openid || openid.length==0)
    {
        wx.showToast({
            icon: 'none',
            title: 'openid异常'
        })
        return 'false';
    }
    let md5 = UTIL.md5
    return md5(md5(path) + md5(openid) + md5('' + str_data) + QUERY_SALT)
}

module.exports={
    genQuerySign: genQuerySign
}