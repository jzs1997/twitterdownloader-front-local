export default function parseDuration(duration){
    return String(duration[0]) + "," + String(duration[1]);
}

export function retriveUserFromCookie(setCookies){
    let e = null;
    for(let i=0; i<setCookies.length; i++){
        console.log(setCookies[i]);
        if(setCookies[i].startsWith('twdownloaduuid')) e = setCookies[i];
    }
    return e.split("=")[-1];
}