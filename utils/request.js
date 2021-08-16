import {
    API_DOMAIN
} from '../config'
const baseUrl = API_DOMAIN;

/**
 * http请求封装
 * @param method 请求方法类型
 * @param url 请求路径
 * @param data 请求参数
 * @param config 请求配置
 * @param config.responseType 响应类型
 * @param config.header 请求头
 * @param config.loading 请求加载效果 {0: 正常加载, 1: 表单提交加载效果 }
 * @param config.loadingMsg 请求提示信息
 */
function httpBase(method, url, data, config = {}) {
    
    const requestUrl = url.indexOf("http")===0?'':baseUrl + url;
    const header = {
        'Content-Type': 'application/json'
    };
    if (config.header) {
        for (let h in config.header) {
            header[h] = config.header[h];
        }
    }
    if (config.loading) {
        wx.showLoading({
            title: config.loadingMsg || "提交中...",
            mask: true,
        });
    } else {
        wx.showNavigationBarLoading();
    }

    function request(resolve, reject) {
        wx.request({
            url: requestUrl,
            method,
            header,
            data,
            timeout: 3000,
            responseType: config.responseType || 'text',
            success: function (result) {
                console.log("result", result)
                if (config.loading) {
                    wx.hideLoading();
                } else {
                    wx.hideNavigationBarLoading();
                }

                let resp = result.data || {};
                let code = resp.code;

                if (code !== 200) {
                    if (503 === code) {
                        // 维护提示
                        wx.reLaunch({
                            url: `/pages/maintenance/maintenance?BText=${resp.maintenance.BText}&OText=${resp.maintenance.OText}`,
                        });
                    } else reject(result);
                    if (resp.error) {
                        wx.showToast({
                            title: resp.error,
                            icon: "none",
                        });
                    }
                } else {
                    // 数据包含cookie信息，所以要处理result对象而不是result.data
                    resolve(result);
                }
            },
            fail: function (res) {
                if (config.loading) {
                    wx.hideLoading();
                } else {
                    wx.hideNavigationBarLoading();
                }
                wx.showToast({
                    title: "网络出错",
                    icon: "none",
                });
                reject(res);
            },
        });
    }

    return new Promise(request);
};

const httpGet = function (url, data = {}, config) {
    return httpBase("GET", url, data, config);
};

const httpPost = function (url, data, config) {
    return httpBase("POST", url, data, config);
};

module.exports = {
    get: httpGet,
    post: httpPost
};