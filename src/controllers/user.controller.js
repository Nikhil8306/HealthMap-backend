// Utils
import apiResponse from "../utils/apiResponse.js";
import { sendVerificationSms, verifyCode } from "../utils/sms.js";
import {generateAccessAndRefreshToken, renewToken} from "../utils/accessAndRefreshToken.js";

// Models
import User from "../models/user.model.js";


const login = async (req, res)=>{
    try{

        let {mobile, countryCode} = req.body;
        if (!mobile) {
            return res
            .status(400)
            .json(apiResponse(400, {}, "Send mobile number"));
        }
        

        if (!countryCode) countryCode = "+91";
        mobile = countryCode+mobile;

        const verification = await(sendVerificationSms(mobile));

        return res.status(200)
            .json(apiResponse());
    }

    catch(err){
        console.error("Error while registering user: ");
        console.log(err);
        return res
        .status(500)
        .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const verifyOtp = async (req, res)=>{
    try{
        let {otp, countryCode,  mobile} = req.body;

        if (!otp || !mobile) {
            return res.status(400)
            .json(apiResponse(400, {}, "Send otp and mobile number"));
        } 

        
        if (!countryCode) countryCode = "+91";
        mobile = countryCode+mobile;

        const verify = await verifyCode(mobile, otp);

        if (!verify) {
            return res.status(403)
            .json(apiResponse(403, {}, "OTP is expired"));
        }

        if (verify.status !== 'approved'){
            return res.status(400)
            .json(apiResponse(400, {}, "Wrong otp"))
        }


        const newUser = await User.create({
            mobile,
        })

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken({_id:newUser._id}, User);

        const options = {
            httpOnly:true,
            secure:true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(apiResponse(200, {
                accessToken,
                refreshToken
            }));
    }       

    catch(err){
        console.error("Error while verifying otp: ");
        console.log(err);

        return res
        .status(500)
        .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const updateProfile = async(req, res)=>{
    try{

        let {name, age, gender, address, diseases} = req.body;

        if (!name) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send name"));
        }
        name = name.trim()
        if (name === ""){
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send proper name"));

        }

        await User.findByIdAndUpdate(req.user._id, {
            name,
            age,
            gender,
            address,
            diseases,
        })

        return res
            .status(200)
            .json(apiResponse());

    }

    catch(err){
        console.log("Error while updating profile : ", err);
        return res
            .status(500)
            .json(500, {}, "Something went wrong");
    }
}

const getProfile = async (req, res)=>{
    try{

        const profile = await User.findById(req.user._id).select("-_id name age gender diseases address");
        return res
            .status(200)
            .json(apiResponse(200, profile));

    }
    catch(err){
        console.log("Error while getting profile : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const logout = async(req, res)=>{
    try{

        await User.findOneAndUpdate(req.user._id, {
            refreshToken:""
        })

        const options = {
            httpOnly:true,
            secure:true,
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(apiResponse());

    }
    catch(err){
        console.log("Error during logout user: ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const refreshTokens = async (req, res)=>{
    try{
        const refreshToken = req.cookies?.refreshToken || req.headers?.refreshToken;
        const data = await renewToken(refreshToken, User);

        const options = {
            httpOnly: true,
            secure:true,
        }

        return res
            .status(200)
            .cookie("accessToken", data.accessToken, options)
            .cookie("refreshToken", data.refreshToken, options)
            .json(apiResponse(200, {
                accessToken:data.refreshToken,
                refreshToken:data.refreshToken
            }));

    }

    catch(err){
        console.log("Error while refresh Token : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

export {login, verifyOtp, updateProfile, getProfile, logout, refreshTokens};