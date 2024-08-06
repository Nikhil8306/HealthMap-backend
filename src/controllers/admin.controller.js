// Utils
import apiResponse from "../utils/apiResponse.js";

// Models
import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const generateAccessToken = async (payload)=>{
    try{
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_ADMIN, {expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
        return {accessToken:accessToken};
    }
    catch(err){
        return err;
    }
}

const login = async (req, res)=>{
    try{
        const {adminId, password}  = req.body;
        if (!adminId || !password) return res.status(400).json({success:false, message:"Send adminId and password"});

        const admin = await Admin.findOne({adminId:adminId});
        if (!admin){
            return res
                .status(400)
                .json(apiResponse(400, {}, "Admin does not exist"));
        }

        const passwordCheck = await bcrypt.compare(password, admin.password);
        if (!passwordCheck) {
            return res.
                status(400)
                .json(apiResponse(400, {}, "Wrong password"));
        }

        const {accessToken} = await generateAccessToken({_id:admin._id});

        if (!accessToken){
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
            .json(apiResponse(200, {accessToken}, "Successfully logged in"));
    }

    catch(err) {
        console.log("Error while login admin : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong !"));
    }
}

const changePassword = async (req, res)=>{
    try{

        let {oldPassword, newPassword} = req.body;

        if (!oldPassword || !newPassword){
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send Password"));
        }

        const admin = await Admin.findById(req.admin._id);

        const passwordCheck = await bcrypt.compare(oldPassword, admin.password);
        if (!passwordCheck) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Your old password is incorrect"));
        }

        newPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUND));

        await Admin.findByIdAndUpdate(admin._id, {password:newPassword});

        const {refreshToken, accessToken} = await generateAccessAndRefreshToken({_id:admin._id}, Admin, "1h", "1d");

        const options = {
            httpOnly:true,
            secure:true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(apiResponse(200, {accessToken, refreshToken}, "Successfully changed the password"));
    }

    catch(err){
        console.log("Error while updating the password : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}


export {login, changePassword}