import { getNewsTag, getNewsList } from './api';
import Url from 'url-parse'
let pageStart = 1;

Page({
	data: {
		duration: 300,  // swiper-item 切换过渡时间
		categoryCur: 0, // 当前数据列索引
		categoryMenu: [], // 分类菜单数据, 字符串数组格式
		categoryData: [], // 所有数据列
		source: 'home'
	},
	getList(type, currentPage) {
		let currentCur = this.data.categoryCur;
		let pageData = this.getCurrentData(currentCur);
		console.log(pageData);

		if (type !== "refresh" && pageData.end) return;

		pageData.requesting = true;
		this.setCurrentData(currentCur, pageData);

		getNewsList(this.data.source, pageData.id, currentPage).then((res) => {
			const resp = res.data;
			let data = resp.data || {
				list: [],
				over: false
			};
			data.over = (currentPage >= pageData.pageCount);
			this.data.domain = resp.data.domain;
			let listData = data.list || [];
			pageData.requesting = false;

			if (type === 'refresh') {
				pageData.listData = listData;
				pageData.end = data.over;
				pageData.page = currentPage + 1;
			} else {
				pageData.listData = pageData.listData.concat(listData);
				pageData.end = data.over;
				pageData.page = currentPage + 1;
			}

			wx.setNavigationBarTitle({
				title: data.name,
			})
			this.setCurrentData(currentCur, pageData);
		});
	},
	// 更新页面数据
	setCurrentData(currentCur, pageData) {
		let categoryData = this.data.categoryData
		categoryData[currentCur] = pageData
		this.setData({
			categoryData: categoryData
		})
	},
	// 获取当前激活页面的数据
	getCurrentData() {
		return this.data.categoryData[this.data.categoryCur]
	},
	// 顶部tab切换事件
	toggleCategory(e) {
		console.log(1212)
		this.setData({
			duration: 0
		});
		setTimeout(() => {
			this.setData({
				categoryCur: e.detail.index
			});
		}, 0);
	},
	// 页面滑动切换事件
	animationFinish(e) {
		this.setData({
			duration: 300,
			categoryCur: e.detail.current
		});
		let pageData = this.getCurrentData();
		if (pageData.listData.length === 0) {
			this.getList('refresh', pageStart);
		}
	},
	// 刷新数据
	refresh() {
		this.getList('refresh', pageStart);
	},
	// 加载更多
	more() {
		this.getList('more', this.getCurrentData(this.data.categoryCur).page);
	},
	showArticle(e) {
		console.log(e);
		let path = e.currentTarget.dataset.link;
		if(path.indexOf('http') === 0){
			let url = new Url(path, true);
			console.log(url)
			wx.navigateTo({
				url: `/pages/articleView/articleView?path=${encodeURIComponent(url.pathname)}&source=${this.data.source}&domain=${url.hostname}`,
			});
		}else{
			wx.navigateTo({
				url: `/pages/articleView/articleView?path=${encodeURIComponent(path)}&source=${this.data.source}&domain=${this.data.domain}`,
			});
		}
	},
	onLoad(options) {
		if (options.source) this.data.source = options.source;
		if (options.tag) this.data.tag = options.tag;
		// get tag
		getNewsTag(this.data.source).then((res) => {
			const resp = res.data;
			let menus = resp.data || [];

			let categoryMenu = [];
			let categoryData = [];

			menus.forEach((item, index) => {
				categoryMenu.push(item.text.replace("&amp;", "&"));
				categoryData.push({
					id: item.name,
					categoryCur: index,
					requesting: false,
					end: false,
					emptyShow: false,
					page: pageStart,
					pageCount: item.total || 1,
					listData: []
				});
			});

			this.setData({
				categoryMenu,
				categoryData
			});

			// 第一次加载延迟 350 毫秒 防止第一次动画效果不能完全体验
			setTimeout(() => {
				this.refresh();
			}, 350);
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		if (typeof this.getTabBar === "function" && this.getTabBar()) {
			this.getTabBar().setData({
				selected: 1,
			});
		}
		wx.showShareMenu({
			withShareTicket: true,
			// for wx
			menus: ["shareAppMessage", "shareTimeline"],
			// for qq
			showShareItems: ["qq", "qzone", "wechatFriends", "wechatMoment"],
		});
	},
	/**
	 * 分享至微信朋友圈
	 */
	onShareTimeline: function () {
		return {
			title: this.data.tabs[this.data.activeTab].text,
			query: `source=${this.data.source}&tag=${this.data.tabs[this.data.activeTab]}`,
		};
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function (e) {
		return {
			title: this.data.tabs[this.data.activeTab].name,
			// for wechat
			path: `/pages/newsList/newsList?source=${this.data.source}&tag=${this.data.tabs[this.data.activeTab]}`,
			// for qq
			query: `source=${this.data.source}&tag=${this.data.tabs[this.data.activeTab]}`,
		};
	},
});

