export default async function sleep(time){
    return new Promise(res=>
        setTimeout(res,time)   
    )
}