// Utils
import apiResponse from "../utils/apiResponse.js";
import { passwordValidation } from "../utils/validations.js";
import { sendVerificationSms, verifyCode } from "../utils/sms.js";

// Models
import User from "../models/user.model.js";

import bcrypt from "bcrypt";

const register = async (req, res)=>{
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

        let {otp, countryCode,  mobile, password} = req.body;

        if (!otp || !mobile) {
            return res.status(400)
            .json(apiResponse(400, {}, "Send otp and mobile number"));
        } 

        if (!password){
            return res.status(400)
            .json(apiResponse(400, {}, "Send password"));
        }

        if (!passwordValidation(password)){
            return res.status(400)
            .json(apiResponse(400, {}, "Send valid password"));
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

        
        password =  bcrypt.hash(password, parseInt(process.env.SALT_ROUND));

        const newUser = await User.create({
            mobile,
            password
        })

        console.log(user);
        return res.status(200).json(apiResponse());
    }       

    catch(err){
        console.error("Error while verifying otp: ");
        console.log(err);

        return res
        .status(500)
        .json(apiResponse(500, {}, "Something went wrong"));
    }
}

export {register, verifyOtp};