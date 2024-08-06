const numberValidation = (value, min=null, max=null)=>{
    let numValue = parseInt(value);

    for(let i = 0; i < value.length; i++){
        if (value[i] < "0" || value[i] > "9") return false;
    }
    if (isNaN(numValue)) return false;

    if (min!=null && max!=null){
        if (numValue < min || numValue > max) return false;
    }

    return true;
}

const mobileValidation = (value)=>{
    return numberValidation(value, 1000, 999999999999999);
}

const countryCodeValidation = (value)=>{
    if (value[0] !== '+') return false;
    if (!numberValidation(value.substring(1, value.length-1), 0, 999)) return false;
    return true;
}

const lengthValidation = (value, maxLength=50)=>{
    return value.length <= maxLength;
}

const genderValidation = (value)=>{
    if (value !== "Male" && value !== "Female" && value !== "Other" ) return false;
    return true;
}

export {mobileValidation, genderValidation, numberValidation, countryCodeValidation, lengthValidation};