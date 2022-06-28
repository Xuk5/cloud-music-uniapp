/*
* 登录流程
* 1.收集表单数据
* 2.前端验证
*   1)用户信息（账号，密码）是否合法
*   2)前端验证不通过就提示用户，不需要发请求给后端
*   3)前端验证通过了，发请求（携带账号、密码给后端）
* 3.后端验证
*   1)验证用户是否存在
*   2)用户不存在直接返回
*   3)验证密码是否正确
*   4)密码不正确返回给前端提示
*   5)密码正确返回给前端数据，提示用户登录成功（会携带用户相关信息）
* */
import request from "../../utils/request";
import regeneratorRuntime from "../../runtime";
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

Page({
    data: {
        phone:'',
        password:'',
        // errorMessage:''
    },
    onLoad: function (options) {

    },
    handleInput:debounce(function (e) {
        let type = e.currentTarget.id
        this.setData({
            [type]:e.detail.value
        })
    },500),
    //登录的回调
    async login(e){
        let {phone,password} = this.data
        //手机号验证
        if (!phone){
            wx.showToast({
                title:'手机号不能为空',
                icon:'none',
            })
            return
        }
        //定义正则表达式
        let phoneReg = /^1[3-9]{2}\d{8}$/
        if (!phoneReg.test(phone)){
            wx.showToast({
                title:'手机号格式错误',
                icon:'none',
            })
            return;
        }
        if (!password){
            wx.showToast({
                title:'密码不能为空',
                icon:'none',
            })
            return
        }
        //手机号、密码验证没有问题，则发送请求进入后端验证
        let res = await request('/login/cellphone',{phone,password,isLogin:true})
        if (res.code === 200){
            wx.showToast({
                title:'登录成功',
            })
            //将用户信息存储至本地
            wx.setStorageSync('userInfo',JSON.stringify(res.profile))
            await this.getUserPlaylist(res.profile.userId)
            //存储完毕后跳转回个人中心页面
            wx.navigateBack()
        }else if (res.code === 400){
            wx.showToast({
                title:'手机号错误',
                icon:'none'
            })
        }else if (res.code === 502){
            wx.showToast({
                title:'密码错误',
                icon:'none'
            })
        }else{
            wx.showToast({
                title:'登录失败，请重新登录',
                icon:'none'
            })
        }
    },
    //获取用户的歌单
    async getUserPlaylist(uid){
        let res = await request('/user/playlist',{uid})
        let id  = res.playlist[0].id
        let result = await request('/playlist/track/all',{id})
        wx.setStorageSync('userPlaylist',result.songs)
    }
});
