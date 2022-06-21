import request from "../../utils/request";

Page({
    data: {
        title:[],
        navId:'',//导航的标识
        videoList:[]//视频列表
    },
    onLoad: function (options) {
        this.getVideoNav().then(value=>{
            this.getVideo(this.data.navId)
        })
    },
    //获取导航数据
    async getVideoNav(){
        let res = await request('/video/group/list')
        let resArr = res.data.splice(0,15)
        this.setData({
            title:resArr,
            navId:resArr[0].id
        })
        return resArr
    },
    //切换导航
    changeNav(e){
        let navId = e.target.dataset.id//获取点击的标签的唯一标识
        //将id保存起来
        this.setData({
            navId
        })
        //当遍历数组时，某项的id与navId相等，则该项拥有下边框

        //点击标签后，获取对应的视频
        this.getVideo(navId)
    },
    //获取对应标签下的视频数据
    async getVideo(id){
        let cookie = wx.getStorageSync('cookies')
        let res =await request('/video/group',{id,cookie})
        for (const item of res.datas) {
            item.id = item.data.vid
            let vUrl = await request('/video/url', {id: item.id})
            let {likedCount,shareCount,commentCount,liked} = await request('/video/detail/info',{vid:item.id})
            item.url = vUrl.urls[0].url
            item.data.info = {likedCount,shareCount,commentCount,liked}
        }
        this.setData({
            videoList:res.datas
        })
    },
});
