//发送ajax请求
import {host,mobilehost} from './config'
export default (url, data = {}, method = 'GET') => {
    return new Promise(((resolve, reject) => {
        wx.request({
            url:host+url,
            method: method.toUpperCase(),
            data,
            success: (res) => {
                if (data.isLogin){//如果请求为登录请求，将cookie存入本地
                    wx.setStorage({
                        key:'cookies',
                        data:res.data.cookie
                    })
                    console.log(res)
                }

                resolve(res.data)
            },
            fail: (reason) => {
                reject(reason)
            }
        })
    }))
}
