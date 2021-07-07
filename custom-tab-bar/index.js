Component({
  data: {
    selected: 0,
    isShow: true,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/index/index",
      iconfont: "icon-index",
      text: "首页"
    }, {
      pagePath: "/pages/homeNews/homeNews",
      iconfont: "icon-zixun",
      text: "资讯"
    }, {
      pagePath: "/pages/my/my",
      iconfont: "icon-user",
      text: "个人中心"
    }],
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})