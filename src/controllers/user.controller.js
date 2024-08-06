// Utils
import apiResponse from "../utils/apiResponse.js";
import { sendVerificationSms, verifyCode } from "../utils/sms.js";
import {mobileValidation, numberValidation, countryCodeValidation, lengthValidation, genderValidation} from "../utils/validations.js";

// Models
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (payload)=>{
    try{
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_USER, {expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_USER, {expiresIn:process.env.REFRESH_TOKEN_EXPIRY});

        await User.findByIdAndUpdate(payload._id, {refreshToken});

        return {accessToken:accessToken, refreshToken:refreshToken};
    }
    catch(err){
        return err;
    }
}

const login = async (req, res)=>{
    try{

        let {mobile, countryCode} = req.body;
        if (!mobile) {
            return res
            .status(400)
            .json(apiResponse(400, {}, "Send mobile number"));
        }
        

        if (!countryCode) countryCode = "+91";


        // Validations
        if (!mobileValidation(mobile)) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send valid mobile number"));
        }
        if (!countryCodeValidation(countryCode)){
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send valid country code"));
        }


        mobile = countryCode+mobile;

        const verification = await(sendVerificationSms(mobile));

        return res.status(200)
            .json(apiResponse());
    }

    catch(err){
        console.error("Error during log in user: ");
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

        // Validations
        if (!mobileValidation(mobile)) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send valid mobile number"));
        }
        if (!countryCodeValidation(countryCode)){
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send valid country code"));
        }
        if (otp.length > 6) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send valid otp code"));
        }

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

        let user;
        if (!await User.findOne({mobile:mobile})) {
            user = await User.create({
                mobile,
            })
        }
        else {
            user = await User.findOne({mobile:mobile});
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken({_id:user._id}, User);

        if (!accessToken || !refreshToken){
            return res
                .status(500)
                .json(apiResponse(500, {}, "Something went wrong"));
        }

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


        //validations
        if (
            !lengthValidation(name, 15) ||
            (age && !numberValidation(age, 1, 150)) ||
            (gender && !genderValidation(gender)) ||
            (address && !lengthValidation(address, 80))
        ) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send proper data"));
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

        await User.findByIdAndUpdate(req.user._id, {
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
        const tokenData = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_USER);

        const data = await  generateAccessAndRefreshToken({_id:tokenData._id});


        const options = {
            httpOnly: true,
            secure:true,
        }

        return res
            .status(200)
            .cookie("accessToken", data.accessToken, options)
            .cookie("refreshToken", data.refreshToken, options)
            .json(apiResponse(200, {
                accessToken:data.accessToken,
                refreshToken:data.refreshToken
            }));

    }

    catch(err){
        console.log("Error while refresh Token : ", err);
        return res
            .status(401)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

export {login, verifyOtp, updateProfile, getProfile, logout, refreshTokens};