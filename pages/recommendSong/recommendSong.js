import request from "../../utils/request";

Page({
    data: {
        songList:[],
    },
    onLoad: function (options) {
        this.getRecommendSongList().then(value => {
            this.setData({
                songList:value
            })
        })
    },
    //获取每日推荐歌曲列表
    async getRecommendSongList(){
        let res = await request('/recommend/songs')
        return res.data.dailySongs
    },

});
