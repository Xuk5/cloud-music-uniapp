export default function (callback,delay) {
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