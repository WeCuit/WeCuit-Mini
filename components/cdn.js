const rsa = require('../utils/rsa/wx_rsa.js');
import {CDN_SALT} from '../config'

var UPYUN = {}
UPYUN.getCdnToken = function(that, app)
{
    var now = Math.round(new Date().getTime()/1000)
    // 服务器token有效期10分钟，此处设定本地有效9分钟
    if(app.globalData.cdnEtime - now > 60 * 9){
        // 原理限制签名是固定的，加判断减少不必要的更新，RSA就需要实时
        if(that.data.cdnToken !== app.globalData.cdnToken){
            let str = app.globalData.cdnToken + CDN_SALT + app.globalData.cdnEtime
            that.setData({
                cdnToken: app.globalData.cdnToken,
                cdnSign: rsa.UTIL.md5(str)
            })
        }
        return;
    }
    wx.login({
        success: res=>{
            if(res.code)
            {
                wx.request({
                    url: app.globalData.API_DOMAIN + '/Cdn/getCDNToken',
                    method: 'POST',
                    header:{
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data:{
                        code: res.code
                    },
                    success: res=>{
                        var data = res.data
                        if(2000 == data.status)
                        {
                            var token = data.token
                            app.globalData.cdnEtime = that.data.cdnEtime = data.etime
                            app.globalData.cdnToken = token
                            let str = token + CDN_SALT + data.etime
                            that.setData({
                                cdnToken: token,
                                cdnSign: rsa.UTIL.md5(str)
                            })
                        }else{
                            wx.showToast({
                                icon: 'none',
                                title: data.errMsg
                            })
                        }
                    }
                })
            }
        },
        fail: err=>{
            console.log(err)
        }
    })
},

module.exports = {
    UPYUN: UPYUN
}