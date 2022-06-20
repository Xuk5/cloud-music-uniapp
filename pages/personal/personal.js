let startY = 0
let moveY = 0
let moveDistance = 0

Page({
    data: {
        coverTransform: 'translateY(0)',
        coverTransition: ''
    },
    onLoad: function (options) {

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
    }
});
