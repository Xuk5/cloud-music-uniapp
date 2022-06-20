//发送ajax请求
import {host,mobilehost} from './config'
export default (url, data = {}, method = 'GET') => {
    return new Promise(((resolve, reject) => {
        wx.request({
            url:host+url,
            method: method.toUpperCase(),
            data,
            success: (res) => {
                resolve(res.data)
            },
            fail: (reason) => {
                reject(reason)
            }
        })
    }))
}
