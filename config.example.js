// 调试模式
const debug = 0
// RSA公钥，用于加密密码
const RSAPubKey = `YOUR_PUBLIC_RSA_KEY`
// 加密盐
const CDN_SALT = 'YOUR_CDN_SALT'
const QUERY_SALT = 'YOUR_QUERY_SALT'

var API_DOMAIN;
if(3 === debug || 2 === debug)
{
    wx.showModal({
        title: "警告",
        content: '测试模式！！！',
        showCancel: false,
    })
}
switch(debug)
{
    case 1:
        API_DOMAIN = 'http://192.168.249.236/api';
        break;
    case 2:
        API_DOMAIN = 'https://test.cuit.api.jysafe.cn/api';
        break;
    case 3:
        API_DOMAIN = 'http://127.0.0.1/api';
        break;
    default:
        API_DOMAIN = 'https://cuit.api.jysafe.cn/api';
        break;
}

module.exports = {
    RSAPubKey: RSAPubKey,
    debug: debug,
    API_DOMAIN: API_DOMAIN,
    CDN_SALT: CDN_SALT,
    QUERY_SALT: QUERY_SALT
}