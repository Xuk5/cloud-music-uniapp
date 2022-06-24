import request from "../../utils/request";
import Pubsub from "pubsub-js";
//获取全局的实例
const app = getApp()
Page({
    data: {
        isPlay: false,
        songInfo: [],
        musicUrl: '',
        oldMusicPic:'',//保存上一首歌的背景图
        isChange:false,//判断是否切换了歌曲
        bar_Height: wx.getSystemInfoSync().statusBarHeight//获取页面状态栏高度
    },
    onLoad: function (options) {
        let id = options.id
        this.getMusicInfo(id).then(v => {
            this.setData({
                songInfo: v.songs,
            })
            return this.getMusicUrl(id)
        }).then(v => {
            this.setData({
                musicUrl: v.data[0].url
            })
            this.musicPlayControl(true)
        })

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

    },
    //修改播放状态的函数
    changePlayState(isPlay) {
        this.setData({
            isPlay
        })
        app.globalData.isMusicPlay = isPlay
    },
    //获取歌曲详情
    async getMusicInfo(id) {
        return await request('/song/detail', {ids: id})
    },
    //获取音乐的播放地址
    async getMusicUrl(id) {
        return await request('/song/url', {id})
    },
    //更改音乐播放状态
    controlPlay() {
        let {isPlay} = this.data
        isPlay = !isPlay
        this.musicPlayControl(isPlay)
    },
    //控制音乐播放/暂停
    musicPlayControl(isPlay) {
        if (isPlay) {//音乐播放
            this.music.title = this.data.songInfo[0].name
            this.music.src = this.data.musicUrl
        } else {//音乐暂停
            this.music.pause()
        }
    },
    //切换歌曲
    switchMusic(e) {
        let type = e.currentTarget.dataset.type
        let {songInfo} = this.data
        this.setData({
            isChange:true,
            isPlay:false,
            //切歌时防止数据还没进来的时候的白屏现象，将上一首歌的背景图片保留，当数据进来了再换成当前的背景
            oldMusicPic:songInfo[0].al.picUrl
        })
        Pubsub.publish('changeSong',type)
        Pubsub.subscribe('getId',(msg,id)=>{
            this.getMusicInfo(id).then(v => {
                this.setData({
                    songInfo: v.songs,

                })
                return this.getMusicUrl(id)
            }).then(v => {
                this.setData({
                    musicUrl: v.data[0].url,
                    isPlay:true,
                    isChange:false
                })
                this.musicPlayControl(true)
            })
        })
    }
});
