
const passwordValidation = (password)=>{
    if (password.length < 6) return false;
    return true;
}

const mobileValidator = (mobile)=>{
    if (mobile.length < 4 || mobile.length > 15) return false;
    for(let i = 0; i < mobile.length; i++){
        if (mobile[i] < '0' || mobile[i] > '9') return false;
    }
    return true;
}


export {passwordValidation, mobileValidator}