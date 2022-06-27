import request from "../../utils/request";

Page({
    data: {
        defaultKeyword:'',
        keywords:'',
        hotSearch:[]
    },
    onLoad: function (options) {
        this.getKeyword()
        this.getHostSearchList()
    },
    //获取默认搜索关键字
    async getKeyword(){
        let res = await request('/search/default')
        this.setData({
            defaultKeyword:res.data.realkeyword
        })
    },
    //获取热搜榜
    async getHostSearchList(){
        let res = await request('/search/hot/detail')
        this.setData({
            hotSearch:res.data
        })
        console.log(res)
    }
});