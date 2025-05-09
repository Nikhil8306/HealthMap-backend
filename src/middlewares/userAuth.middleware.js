import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next)=>{
    try{
        const accessToken  = req.cookies?.accessToken || req.headers?.accesstoken;

        if (!accessToken) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Access Token not found"));
        }

        const user = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_USER);

        req.user = {_id:user._id};


        next();

    }

    catch(err){

        return res
            .status(401)
            .json(apiResponse(401, {}, "Access Token expired"));
    }
}


export default userAuth;