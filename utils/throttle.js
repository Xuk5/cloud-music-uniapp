
export default function (callback,delay) {
    let timer
    return function (e) {
        if (!timer){
            timer = setTimeout(()=>{
                callback.call(this,e)
                timer = null
            },delay)
        }
    }
}