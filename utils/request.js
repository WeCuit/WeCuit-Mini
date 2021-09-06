/**
 * http请求封装
 * @param method 请求方法类型
 * @param url 请求路径
 * @param data 请求参数
 * @param loading 请求加载效果 {0: 正常加载, 1: 表单提交加载效果 }
 * @param loadingMsg 请求提示信息
 */
let baseUrl = null;
const init = (url)=>{
    baseUrl = url
}
function httpBase(method, url, data, contentType, loading, loadingMsg) {

    let requestUrl = baseUrl + url;

    if (loading) {
        wx.showLoading({
            title: loadingMsg || "提交中...",
            mask: true,
        });
    } else {
        wx.showNavigationBarLoading();
    }

    function request(resolve, reject) {
        wx.request({
            header: {
                "Content-Type": contentType,
            },
            method: method,
            url: requestUrl,
            data: data,
            success: function (result) {
                if (loading) {
                    wx.hideLoading();
                } else {
                    wx.hideNavigationBarLoading();
                }

                let res = result.data || {};
                let code = res.errorCode;

                if (code !== 2000) {
                    if (10503 === code) {
                        wx.reLaunch({
                            url: `/pages/maintenance/maintenance?BText=${res.maintenance.BText}&OText=${res.maintenance.OText}`,
                        });
                    } else reject(res);
                    if (res.errMsg) {
                        wx.showToast({
                            title: res.errMsg,
                            icon: "none",
                        });
                    }
                } else {
                    resolve(res);
                }
            },
            fail: function (res) {
                reject(res);
                if (loading) {
                    wx.hideLoading();
                } else {
                    wx.hideNavigationBarLoading();
                }
                wx.showToast({
                    title: "网络出错",
                    icon: "none",
                });
            },
        });
    }

    return new Promise(request);
};
const httpGetForm = function ({
    url = "",
    data = {},
    loading = false,
    loadingMsg = "",
} = {}) {
    return httpBase("GET", url, data, "application/x-www-form-urlencoded", loading, loadingMsg);
};
const httpPostForm = function ({
    url = "",
    data = {},
    loading = false,
    loadingMsg = "",
} = {}) {
    return httpBase("POST", url, data, "application/x-www-form-urlencoded", loading, loadingMsg);
};

const httpPostJson = function ({
    url = "",
    data = {},
    loading = false,
    loadingMsg = "",
} = {}) {
    return httpBase("POST", url, data, "application/json", loading, loadingMsg);
};


module.exports = {
    init: init,
    httpGetForm: httpGetForm,
    httpPostForm: httpPostForm,
    httpPostJson: httpPostJson
};
