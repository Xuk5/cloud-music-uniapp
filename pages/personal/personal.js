import request from "../../utils/request";
import Pubsub from "pubsub-js";
let startY = 0
let moveY = 0
let moveDistance = 0

Page({
    data: {
        coverTransform: 'translateY(0)',
        coverTransition: '',
        userInfo:{},
        recentPlayList:[],//用户播放记录
    },
    onLoad:function (options) {
        //读取用户基本信息
        let userInfo = JSON.parse(wx.getStorageSync('userInfo'))
        if (userInfo){
            this.setData({
                userInfo
            })
            this.getUserRecentPlayRecord(userInfo.userId).then(r=>{

            })
        }

    },
    //获取用户播放记录
    async getUserRecentPlayRecord(userId){
        let recentPlayList = await request('/user/record',{uid:userId,type:0})
        let index = 0
        recentPlayList = recentPlayList.allData.splice(0,10).map(item=>{
            item.id = item.song.id
            return item
        })
        this.setData({
            recentPlayList
        })
    },
    handleTouchStart(e) {
        this.setData({
            coverTransition: ''
        })
        startY = e.touches[0].clientY;//获取手指的起始坐标
    },
    bindTouchMove(e) {
        moveY = e.touches[0].clientY
        moveDistance = moveY - startY
        if (moveDistance <= 0) return
        if (moveDistance >= 80) {
            moveDistance = 80
        }
        this.setData({
            coverTransform: `translateY(${moveDistance}rpx)`,
        })
    },
    bindTouchEnd(e) {
        this.setData({
            coverTransform: `translateY(0)`,
            coverTransition: 'transform .5s linear'
        })
    },
    //登录界面跳转
    login(){
        wx.navigateTo({
            url:'/pages/login/login'
        })
    },
    onShow:function () {
        let {userInfo} = this.data
        if (!userInfo.length){
            Pubsub.subscribe('getUserInfo',(mas,data)=>{
                let {userInfo} = this.data
                userInfo = JSON.parse(wx.getStorageSync('userInfo'))
                console.log(userInfo)
                this.setData({
                    userInfo
                })
                this.getUserRecentPlayRecord(userInfo.userId).then(r=>{

                })
            })
        }
    }
});
