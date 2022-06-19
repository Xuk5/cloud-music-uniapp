// pages/index/index.js
import request from "../../utils/request";
import regeneratorRuntime from '../../runtime';//用于解决async/await无法使用的问题
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		bannerList:[],
		recommendList:[],
		ranking:[]
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad:async function (options) {
		let banner = await request('/banner',{type:2})
		let recommend = await request('/personalized',{limit:10})
		this.setData({
			bannerList:banner,
			recommendList:recommend.result,
		})
		let index = 0
		let resultArr = []
		while (index<5){
			let rankList = await request('/top/list',{idx:index++})
			let rankListItem = {
				id:rankList.playlist.id,
				name:rankList.playlist.name,
				tracks:rankList.playlist.tracks.slice(0,3)
			}
			resultArr.push(rankListItem)
			//每发一次请求就更新界面
			this.setData({
				ranking:resultArr
			})
		}

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})
