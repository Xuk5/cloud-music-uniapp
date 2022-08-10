import Pubsub from "pubsub-js";
import request from "../../utils/request";

const app = getApp()
Component({
    properties: {},
    data: {
        isPlay: false,
        songInfo: [],
        songRecord: {}
    },
    lifetimes: {
        attached: function () {
            this.music = wx.getBackgroundAudioManager()
            let that = this
            wx.getStorage({
                key: 'songInfo',
                success(res) {
                    that.setData({
                        songInfo: res.data,
                    })
                }

            })

            Pubsub.subscribe('getSongInfo', (msg, data) => {
                console.log(data)
                this.setData({
                    songInfo: data,
                })
            })
            Pubsub.subscribe('controlPlay', (msg, data) => {
                this.setData({
                    isPlay: data
                })
            })
            this.music.onPlay(() => {
                this.changePlayState(true)
            })
            this.music.onPause(() => {
                this.changePlayState(false)
            })
            // this.music.onTimeUpdate(() => {
            //     this.handelPlayTime(this.music.currentTime)
            // })
        },
    },
    methods: {
        //控制动画
        changePlayState(isPlay) {
            this.setData({
                isPlay
            })
            app.globalData.isMusicPlay = isPlay
        },
        //播放栏的播放按钮回调
        changePlay() {
            let {isPlay} = this.data
            this.changePlayState(!isPlay)
            this.musicPlayControl(!isPlay)
        },
        //控制系统音乐的播放与暂停
        musicPlayControl(isPlay) {
            let {songInfo} = this.data
            if (isPlay) {
                this.music.title = songInfo[0].name
                this.getMusicUrl(songInfo[0].id).then(v => {
                    this.music.src = v.data[0].url
                })
            } else {
                this.music.pause()
            }
        },
        async getMusicUrl(id) {
            return await request('/song/url', {id})
        },
        goDetail() {
            let {songInfo} = this.data
            wx.navigateTo({
                url: '/pages/songDetail/songDetail?id=' + songInfo[0].id,
                complete(res) {
                    console.log(res)
                }
            })
        },

    },
});
