// Utils
import generateAccessAndRefreshToken from "../utils/accessAndRefreshToken.js";
import apiResponse from "../utils/apiResponse.js";

// Models
import Admin from "../models/admin.model.js";

import bcrypt from "bcrypt";
import Worker from "worker_threads";


// Path
const parserPath = "../xlsxParser.js";


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

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken({_id:admin._id}, Admin, "1hr", "1d");

        const options = {
            httpOnly:true,
            secure:true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(apiResponse(200, {accessToken, refreshToken}, "Successfully logged in"));
    }

    catch(err) {
        console.log("Error while login admin : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const changePassword = (req, res)=>{

}

const uploadHospitals = async (req, res)=>{
    try{
        const parserWorker = new Worker(parserPath, {workerData : {sheets: req.file}});
        console.log(parserWorker);

        res.send("ok");
    }
    catch (err){
        console.log("Error while uploading hospitals : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

export {login, uploadHospitals}