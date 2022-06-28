import request from "../../utils/request";
//防抖函数
function debounce(callback,delay) {
    let timer
    return function (e) {
        if (timer){
            clearTimeout(timer)
        }
        timer = setTimeout(()=>{
            callback.call(this,e)
        },delay)
    }
}

//搜索结果的列表
let searchList = []
Page({
    data: {
        defaultKeyword:'',
        keywords:'',
        hotSearch:[],
        searchHistory:[],
        isSearching:false,
        searchAdvice:[],
        hiddenSearchHistory:[],
        isHidden:true
    },
    onLoad: function (options) {
        let {hiddenSearchHistory} = this.data
        this.getKeyword()
        this.getHostSearchList()
        wx.getStorage({
            key: 'searchHistory',
            success: ({data}) => {
                if (data.length > 3) {
                    hiddenSearchHistory = data.slice(0, 3)
                }
                this.setData({
                    searchHistory:data,
                    hiddenSearchHistory
                })
            }
        })


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
    },
    //处理输入
    handelInput:debounce(function (e) {
        this.setData({
            keywords:e.detail.value.trim(),
            isSearching:true
        })
        this.getAdvice().then(value => {
            if (this.data.keywords === ''){
                this.setData({
                    isSearching:false
                })
            }
        })
    },500),
    //搜索
    async goSearch(e){
        let keywords = e.currentTarget.dataset.keywords || this.data.keywords
        let searchHistory = wx.getStorageSync('searchHistory') || []
        if (searchHistory.indexOf(keywords) !== -1){
            searchHistory.splice(searchHistory.indexOf(keywords),1)
        }
        searchHistory.unshift(keywords)
        this.setData({
            searchHistory
        })
        wx.setStorageSync('searchHistory',searchHistory)
        let res = await request('/search',{keywords,offset:0})
        searchList = res.result.songs
        console.log(res)
    },
    //获取搜索建议
    async getAdvice(){
        let {keywords} = this.data
        let searchAdvice = []
        let res = await request('/search/suggest',{keywords})
        for (let v in res.result){
            if (res.result[v].every(item=>typeof item === 'object')){
                searchAdvice = searchAdvice.concat(...res.result[v])
            }
        }
        this.setData({
            searchAdvice
        })
    },
    //清空输入框
    clearInput(){
        this.setData({
            keywords: '',
            isSearching:false
        })
    },
    // 清除历史记录
    clearHistory(){
        wx.showModal({
            content:'确定清空全部历史记录？',
            success:({confirm,cancel})=>{
                if (confirm){//当点击确认清空历史记录时
                    try {
                        wx.removeStorageSync('searchHistory')
                    } catch (e) {
                        // Do something when catch error
                        wx.showToast({
                            title:'删除失败，请稍后重试',
                            icon:"none"
                        })
                    }
                    this.setData({
                        searchHistory:[]
                    })
                }
            }
        })
    },
    //隐藏历史记录
    hideHistory(){
        let {hiddenSearchHistory,searchHistory,isHidden} = this.data
        hiddenSearchHistory = searchHistory.slice(0,3)
        this.setData({
            hiddenSearchHistory,
            isHidden:!isHidden
        })
    }
});
