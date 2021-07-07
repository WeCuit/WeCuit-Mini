// pages/imgCropper/imgCropper.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:'',
    width: app.globalData.windowWidth,//宽度
    height: app.globalData.windowHeight,//高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取到image-cropper实例
    this.cropper = this.selectComponent("#image-cropper");
    //开始裁剪
    this.setData({
        src: options.src
    });
    wx.showLoading({
        title: '请求中~'
    })
  },
  cropperLoad(e){
  },
  loadImage(e){
      wx.hideLoading();
      //重置图片角度、缩放、位置
      this.cropper.imgReset();
  },
  clickCut(e) {
      //点击裁剪框阅览图片
      wx.previewImage({
          current: e.detail.url, // 当前显示图片的http链接
          urls: [e.detail.url] // 需要预览的图片http链接列表
      })
  },
  confirmCut: function(){
    this.cropper.getImg((res)=>{
      console.log(res)
      app.globalData.tempBackImg = res.url
      wx.navigateBack({
        delta: 1
      })
    })
  },
})