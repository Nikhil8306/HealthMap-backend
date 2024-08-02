import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (payload, model, access_expiry = process.env.ACCESS_TOKEN_EXPIRY, refresh_expiry=process.env.REFRESH_TOKEN_EXPIRY)=>{
    try{
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn:access_expiry});
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn:refresh_expiry});

        await model.findByIdAndUpdate(payload._id, {refreshToken});

        return {accessToken:accessToken, refreshToken:refreshToken};
    }
    catch(err){
        return err;
    }
}

const renewToken = async (token , model,  access_expiry = process.env.ACCESS_TOKEN_EXPIRY, refresh_expiry=process.env.REFRESH_TOKEN_EXPIRY)=>{
    try{
        const data = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const {accessToken, refreshToken} = await  generateAccessAndRefreshToken({_id:data._id}, model, access_expiry, refresh_expiry);

        return {accessToken, refreshToken};

    }

    catch(err){
        return err;
    }
}

export {generateAccessAndRefreshToken, renewToken};