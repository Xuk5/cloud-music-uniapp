import request from "../../utils/request";

Page({
    data: {
        navTitle: [],
        navId: '',//导航的标识
        videoList: [],//视频列表
        playingVideo: '',//视频的id标识
        videoUpdate:[],//用于记录视频播放的时长和视频的Id
        isTriggered:false,//记录是否  开启下拉刷新
        refreshIndex:0,//记录分页数据
    },

    onLoad: function (options) {
        this.getVideoNav().then(value => {
            return this.getVideo(this.data.navId)
        }).then(value => {
            this.setData({
                videoList:value
            })
        })
    },
    //获取导航数据
    async getVideoNav() {
        let randomNum = Math.round(Math.random()*77)
        let res = await request('/video/group/list')
        let resArr = res.data.slice(randomNum, randomNum+16)
        this.setData({
            navTitle: resArr,
            navId: resArr[0].id
        })
        return resArr
    },
    //切换导航
    changeNav(e) {
        let navId = e.target.dataset.id//获取点击的标签的唯一标识
        //将id保存起来
        this.setData({
            navId,
            videoList: []
        })
        wx.showLoading({
            title: '正在加载',
            // success:()=
        })
        //当遍历数组时，某项的id与navId相等，则该项拥有下边框
        //点击标签后，获取对应的视频
        this.getVideo(navId).then(v => {
            wx.hideLoading()
            this.setData({
                videoList:v,
                refreshIndex:0
            })
        })
    },
    //获取对应标签下的视频数据
    async getVideo(id,offset=0) {
        let cookie = wx.getStorageSync('cookies')
        let res = await request('/video/group', {id, offset,cookie})
        for (const item of res.datas) {
            item.id = item.data.vid
            let vUrl = await request('/video/url', {id: item.id})
            let {likedCount, shareCount, commentCount, liked} = await request('/video/detail/info', {vid: item.id})
            item.url = vUrl.urls[0].url
            item.data.info = {likedCount, shareCount, commentCount, liked}
        }
        this.setData({
            isTriggered:false
        })
        return res.datas
    },
    //点击播放/继续播放的回调
    handlePlay(e) {
        //找到上一个播放的视频
        //在播放新的视频之前关闭上一个播放的视频
        let id = e.target.id
        let {videoUpdate} = this.data
        this.setData({
            playingVideo: id
        })
        let currentPlay = wx.createVideoContext(id)
        //判断当前视频是否有播放记录
        let videoItem = videoUpdate.find(item=>item.vid === id)
        if (videoItem){//如果有，跳转到播放记录的时间
            currentPlay.seek(videoItem.currentTime)
        }else {//如果没有，从头播放
            currentPlay.play()
        }
    },
    //记录播放时长的回调
    handlePlayTime(e){
        /*
        * 判断记录播放时长的videoUpdate数组中是否有当前视频的播放记录
        * 1.如果有，将原有的播放记录中修改播放时间为当前的播放时间
        * 2.如果没有，需要在数组中添加当前视频的播放对象
        * */
        let videoInfo ={
            vid:e.currentTarget.id,
            currentTime:e.detail.currentTime
        }
        let {videoUpdate} = this.data
        //判断是否有当前视频的播放记录
        let videoItem = videoUpdate.find(item=>item.vid === videoInfo.vid)
        if (videoItem){
            //如果有，更新播放时长
            videoItem.currentTime = videoInfo.currentTime
        }else {//如果没有，添加播放对象
            videoUpdate.push(videoInfo)
        }
        //更新状态
        this.setData({
            videoUpdate
        })
    },
    //播放结束时的回调
    handleEnded(e){
        let {videoUpdate} = this.data
        //视频播放结束后，删除对应的播放时长记录对象
        videoUpdate.splice(videoUpdate.findIndex(item=>item.vid === e.currentTarget.id),1)
        this.setData({
            videoUpdate
        })
    },
    //视频区下拉刷新回调:针对视频区scroll-view
    handleRefresh(){
        let randomPage = Math.round(Math.random()*100)
        this.getVideo(this.data.navId,randomPage).then(value => {
            this.setData({
                videoList:value
            })
        })
    },
    //上拉加载:针对视频区scroll-view
    handleToLower(){
        //到底后获取更多数据，做数据分页
        let {videoList,refreshIndex} = this.data
        //每次发请求的时候都将分页数据+1，拿到新一页的数据展示
        this.getVideo(this.data.navId,refreshIndex+1).then(value => {
            videoList.push(...value)
            this.setData({
                videoList,
                refreshIndex:refreshIndex+1
            })
        })
    },
    //整个页面的下拉刷新
    onPullDownRefresh() {
        this.setData({
            navTitle:[],
            navId:'',
            videoList:[]
        })
        let randomPage = Math.round(Math.random()*100)
        this.getVideoNav().then(value => {
            return this.getVideo(this.data.navId,randomPage)
        }).then(value => {
            this.setData({
                videoList:value
            })
        }).then(value => {
            wx.stopPullDownRefresh()
        })
    },
    handleShare(e){
        let {url,coverUrl} = e.currentTarget.dataset

        wx.shareVideoMessage({
            videoPath:url,
            thumbPath:coverUrl
        })
    },
    onShareAppMessage({from}) {
        return{
            title:'视频',
            page:'/pages/video/video'
        }
    }
});
