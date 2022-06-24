import request from "../../utils/request";
import Pubsub from 'pubsub-js'
Page({
    data: {
        songList:[],
        isScroll:false,
        day:'',
        month:'',
        index:0//点击音乐的下标
    },
    onLoad: function (options) {
        //判断用户是否登录
        if (!wx.getStorageSync('userInfo')){
            wx.showToast({
                title:'请先登录',
                icon:"none",
                success:()=>{
                    wx.navigateTo({
                        url:'/pages/login/login'
                    })
                }
            })
        }
        //更新日期信息
        this.setData({
            day:new Date().getDate(),
            month:new Date().getMonth()+1
        })
        this.getRecommendSongList().then(value => {
            this.setData({
                songList:value
            })
        })
        //订阅来自songDetail的消息
        Pubsub.subscribe('changeSong',(msg,type)=>{
            let {songList,index} = this.data
            console.log(index,typeof index)
            if (type === 'last'){//上一首歌
                if (index === 0){
                    index = songList.length-1
                }else {
                    index -= 1
                }
            }else {//下一首歌
                if (index === songList.length-1){
                    index = 0
                }else {
                    index += 1
                }
            }
            console.log(songList,index)
            let id = songList[index].id
            //发布消息将id传给歌曲详情页面
            Pubsub.publish('getId',id)
            this.setData({
                index
            })
        })
    },
    onShow() {
    },
    //获取每日推荐歌曲列表
    async getRecommendSongList(){
        let res = await request('/recommend/songs')
        return res.data.dailySongs
    },
    handelDrag(e){
        if (e.changedTouches[0].pageY - e.changedTouches[0].clientY <= 50) {
            wx.pageScrollTo({
                scrollTop: 0,//页面滚动到顶部
                duration: 500
            })
            this.setData({
                isScroll: false
            })
        } else {//当滑动一定距离后，开启内部歌单列表的滑动
            wx.pageScrollTo({
                scrollTop: 99999,//页面滚动到最底部
                duration: 500
            })
            this.setData({
                isScroll: true
            })
        }
    },
    //点击歌曲跳转到歌曲详情
    goMusic({currentTarget}){
        let {id,index} = currentTarget.dataset
        console.log(index)
        this.setData({
            index:index
        })

        wx.navigateTo({
            url:'/pages/songDetail/songDetail?id='+ id
        })
    }
});
