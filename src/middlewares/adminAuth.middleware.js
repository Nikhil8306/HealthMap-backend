import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next)=>{
    try{
        const accessToken  = req.cookies?.accessToken || req.headers?.accesstoken;

        if (!accessToken) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Access Token not found"));
        }

        const admin = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        req.admin._id = admin._id;

        next();

    }

    catch(err){
        return res
            .status(400)
            .json(apiResponse(400, {}, "Access Token expired"));
    }
}

export default adminAuth;