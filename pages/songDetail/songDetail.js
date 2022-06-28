import request from "../../utils/request";
import Pubsub from "pubsub-js";
import moment from "moment";
//获取全局的实例
const app = getApp()
let playMusicIndex = 0
Page({
    data: {
        isPlay: false,
        songInfo: [],
        musicUrl: '',
        oldMusicPic: '',//保存上一首歌的背景图
        isChange: false,//判断是否切换了歌曲
        bar_Height: wx.getSystemInfoSync().statusBarHeight,//获取页面状态栏高度
        currentTime: '00:00',
        totalTime: '--:--',
        currentWidth: 0,
        songList:[],//当前播放的音乐列表
        index:0,//当前正在播放的歌曲在列表中的索引值
        switchList:[[],[],[]]//用于切换光盘动画的列表
    },

    onLoad: function (options) {
        let id = options.id
        this.getMusicList(id)
        //音乐详情界面退出再进来时判断音乐是否在播放，并判断播放的歌曲与当前页面的歌曲是否一致
        if (app.globalData.isMusicPlay && app.globalData.musicId === id) {
            this.setData({
                isPlay: true
            })
        }
        //通过控制音频的实例来监听音乐的播放/暂停,解决系统的播放暂停与页面内不一致的问题
        //创建控制音乐播放的实例对象
        this.music = wx.getBackgroundAudioManager()
        this.music.onPlay(() => {
            this.changePlayState(true)
            app.globalData.musicId = id
        })
        this.music.onPause(() => {
            this.changePlayState(false)
        })
        this.music.onStop(() => {
            this.changePlayState(false)
        })
        this.music.onTimeUpdate(() => {
            let {songInfo} = this.data
            let currentTime = moment(this.music.currentTime * 1000).format('mm:ss')
            let currentWidth = this.music.currentTime / this.music.duration * 450
            this.setData({
                currentTime,
                currentWidth
            })
        })
        this.music.onEnded(()=>{
            //自然播放结束后切下一首歌
            this.switchMusic(undefined,'next')
        })

    },
    //修改播放状态的函数
    changePlayState(isPlay) {
        setTimeout(()=>{
            this.setData({
                isPlay
            })
        },500)
        app.globalData.isMusicPlay = isPlay
    },
    //获取歌曲详情
    async getMusicInfo(id) {
        let res = await request('/song/detail', {ids: id})
        let totalTime = moment(res.songs[0].dt).format('mm:ss')
        this.setData({
            totalTime
        })
        return res
    },
    //获取音乐的播放地址
    async getMusicUrl(id) {
        return await request('/song/url', {id})
    },
    //点击播放/暂停键的回调
    controlPlay() {
        let {isPlay} = this.data
        isPlay = !isPlay
        this.musicPlayControl(isPlay)
    },
    //控制系统的音乐播放/暂停
    musicPlayControl(isPlay) {
        if (isPlay) {//音乐播放
            this.music.title = this.data.songInfo[0].name
            this.music.src = this.data.musicUrl
        } else {//音乐暂停
            this.music.pause()
        }
    },
    //切换歌曲
    switchMusic(e,switchType) {
        let type = switchType || e.currentTarget.dataset.type
        let {songList,songInfo,index,switchList} = this.data
        if (type === 'last'){//上一首歌
            index === 0?index = songList.length-1:index-=1
        }else {//下一首歌
            index === songList.length-1?index=0:index+=1
        }
        this.changeSwiper(index)
        this.setData({
            isChange: true,
            isPlay: false,
            //切歌时防止数据还没进来的时候的白屏现象，将上一首歌的背景图片保留，当数据进来了再换成当前的背景
            oldMusicPic: songInfo[0].al.picUrl,
            index,
        })
        songInfo[0] = songList[index]
        this.getMusicUrl(songList[index].id).then(value => {
            this.setData({
                musicUrl:value.data[0].url,
                songInfo,
                isChange:false,
            })
            this.musicPlayControl(true)
        })

    },
    //进度条拖动完成后
    dragEnd(e){
        let currentTime = (e.detail.value/450)*this.music.duration
        //进度跳转
        this.music.seek(currentTime)
        this.music.play()
    },
    //进度拖动时
    dragging(e){
        this.music.pause()
        //实时更新当前时间
        let currentTime = moment((e.detail.value/450)*this.music.duration*1000).format('mm:ss')
        this.setData({
            currentTime
        })
    },
    //获取进入音乐详情界面前的歌单列表
    getMusicList(id){
        Pubsub.publish('sendSongList')
        Pubsub.subscribe('getSongList', (msg,data) => {
            //如果没有传songList，则获取用户自己的歌单，并将这首歌加入歌单
            let songList = data || wx.getStorageSync('userPlaylist')
            this.getMusicInfo(id).then(v => {
                if (songList.indexOf(v.songs[0]) === -1){
                    songList.unshift(v.songs)
                    wx.setStorageSync('userPlaylist',songList)
                }
                this.setData({
                    songInfo: v.songs,
                    songList
                })
                return this.getMusicUrl(id)
            }).then(v => {
                let index = songList.findIndex(item=>{
                    return id-0 === item.id
                })
                this.changeSwiper(index)
                this.setData({
                    index,
                    musicUrl: v.data[0].url,
                    isPlay: true,
                    isChange: false
                })
                this.musicPlayControl(true)
            })
        })
    },
    //光碟
    changeSwiper(index){
        let {switchList,songList} = this.data
        switchList[playMusicIndex -1 === -1?2:playMusicIndex-1] = songList[index===0?songList.length-1:index-1]
        switchList[playMusicIndex] = songList[index]
        switchList[playMusicIndex +1 === 3?0:playMusicIndex+1] = songList[index === songList.length-1?0:index+1]
        this.setData({
            switchList
        })
    },

});
