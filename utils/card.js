const rsa = require('rsa/wx_rsa.js');
class Card{
    constructor(api){
        this.API = api;
    }
    // 获取支付二维码
    getPayQRCode(accNum) {
        return new Promise((resolve, reject)=>{
            wx.request({
                url: this.API + "/Card/getQRCode",
                method: "POST",
                header: {
                    "content-type": "application/x-www-form-urlencoded",
                },
                data: {
                    AccNum: accNum,
                    sign: this.genSign(accNum)
                },
                success: (res) => {
                    if (200 == res.statusCode) {
                        if(res.data.status === 2000)
                        resolve(res);
                        else reject(res.data)
                    } else {
                        wx.showToast({
                            icon: "none",
                            title: "请求失败",
                        });
                        reject();
                    }
                },
            });
        })
    }
    genSign(str){
        return rsa.UTIL.md5(rsa.UTIL.md5(str) + '|' + str + '|' + rsa.UTIL.md5(str))
    }
    
    // 查询支付状态
    queryPayStatus(qrCode) {
        return new Promise((resolve, reject)=>{
            wx.request({
                url: this.API + "/Card/getQRCodeInfo",
                method: "POST",
                header: {
                    "content-type": "application/x-www-form-urlencoded",
                },
                data: {
                    QRCode: qrCode,
                },
                success: (res) => {
                    if (200 == res.statusCode) {
                        resolve(res)
                    } else {
                        reject(false)
                    }
                },
                fail:(err)=>{
                    reject(err)
                }
            });
        })
    }
}

module.exports={
    Card: Card
}