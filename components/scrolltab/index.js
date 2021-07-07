// components/scrolltab/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabdata: { // tab数据
      type: null,
      observer: function(newVal, oldVal) {

        var that = this;

        that.setData({
          college: newVal
        })

      }
    },
    scrollTop: { //滚动的高度
      type: null,
      observer: function(newVal, oldVal) {
        var that = this;
        that.setData({
          scrollTop: newVal
        })

      }
    },
    scrollH: { //距离顶部的高度
      type: null,
      observer: function(newVal, oldVal) {

        var that = this;
        that.setData({
          scrollH: newVal
        })

      }
    },
    currentTab: { //当前标签
      type: null,
      observer: function(newVal, oldVal) {
        var that = this;
        that.setData({collegeCur: newVal})

      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    college: [],
    collegeCur: 0,
    scrollTop: 0,
    scrollH: 0, //滚动的高度
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //选择分类
    collegeSelect(e) {
      this.setData({
        collegeCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id - 2) * 150,
        showList: false,
      })
      this.getList();
    },

    //操作获取数据
    getList() {
      var that = this;

      that.triggerEvent('tabtap', that.data.collegeCur)
    },
  }
})