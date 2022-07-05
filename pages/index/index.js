// pages/index/index.js
import request from "../../utils/request";
import regeneratorRuntime from '../../runtime';
import Pubsub from "pubsub-js";

//用于解决async/await无法使用的问题
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		bannerList:[],
		recommendList:[],
		rankList:[],
		defaultKeyword:'',
		bar_Height: wx.getSystemInfoSync().statusBarHeight
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad:async function (options) {
		this.getKeyword()
		let banner = await request('/banner',{type:2})
		let recommend = await request('/personalized',{limit:10})
		this.setData({
			bannerList:banner,
			recommendList:recommend.result,
		})
		let rankList = []
		//获取所有歌单列表
		let res = await request('/toplist')
		//只截取前五个歌单的数据
		let resultArr = res.list.splice(0,5)
		for (const item of resultArr) {//对歌单数据做循环
			//将歌单的id作为参数发送请求获取歌单详细信息
			let res = await request('/playlist/detail',{id:item.id})
			//每个歌单只取前三首歌
			let trackList = res.playlist.tracks.splice(0,3)
			//将歌单信息封装到对象中为页面渲染做准备
			let songObj = {
				name:item.name,
				id:item.id,
				tracks:trackList
			}
			rankList.push(songObj)
		}
		this.setData({
			rankList,
		})

	},
	dailyRecommend(){
		wx.navigateTo({
			url:"/pages/recommendSong/recommendSong"
		})
	},
	//获取默认搜索关键字
	async getKeyword(){
		let res = await request('/search/default')
		this.setData({
			defaultKeyword:res.data.realkeyword
		})
	},
	goSearchPage(){
		wx.navigateTo({
			url:'/pages/search/search'
		})
	},
	//点击歌曲前往音乐界面
	goDetail(e){
		let {songid,listid} = e.currentTarget.dataset
		Pubsub.subscribe('sendSongList',()=>{
			this.getSongList(listid).then(v=>{
				Pubsub.publish('getSongList',v.playlist.tracks)
			})
		})
		wx.navigateTo({
			url:'/pages/songDetail/songDetail?id='+songid,
			success:()=>{

			}
		})
	},
	//获取歌单详情
	async getSongList(id){
		let res = await request('/playlist/detail',{id})
		return res
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

	},

})
