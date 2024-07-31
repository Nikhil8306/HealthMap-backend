// Utils
import generateAccessAndRefreshToken from "../utils/accessAndRefreshToken.js";
import apiResponse from "../utils/apiResponse.js";

// Models
import Admin from "../models/admin.model.js";
import Hospital from "../models/hospital.model.js";

import XLSX from "xlsx";
import bcrypt from "bcrypt";
import {Worker} from "worker_threads";


// Path
const parserPath = "./src/xlsxParser.js";


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

const changePassword = async (req, res)=>{
    try{

        let {oldPassword, newPassword} = req.body;

        if (!password || !newPassword){
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send Valid Password"));
        }

        const admin = await Admin.findById(req.admin._id);

        const passwordCheck = await bcrypt(oldPassword, admin.password);
        if (!passwordCheck) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Your old password is incorrect"));
        }

        newPassword = bcrypt.hash(newPassword, process.env.SALT_ROUND);

        await Admin.findByIdAndUpdate({password:newPassword});

        return res
            .status(200)
            .json(apiResponse());


    }

    catch(err){
        console.log("Error while updating the password : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const uploadHospitals = async (req, res)=>{
    try{
        const data = XLSX.readFile(req.file.path);

        const parserWorker = new Worker(parserPath, {workerData : {sheets: data}});

        parserWorker.on("message", async (data)=>{
            for(let i = 0; i < data.length; i++){
                if (!data[i]["S.No"] || data[i]["S.No"] === "") continue;

                const newHospital = await Hospital.create({
                    sNo: data[i]["S.No"],
                    address: data[i]["Address"],
                    beds:data[i]["Beds"],
                    name: data[i]["Hospital Name"],
                    bookingLink: data[i]["Booking Link"],
                    website: data[i]["Website"],
                    email: data[i]["e-mail"],
                    contact1: data[i]["Contact 1"],
                    contact2: data[i]["Contact 2"],
                    emergency: data[i]["Emergency"],
                    amenities: data[i]["Amenities"],
                    specialities:data[i]["Specialities"],
                })
            }

            return res
                .status(200)
                .json(apiResponse());
        })
    }
    catch (err){
        console.log("Error while uploading hospitals : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

export {login, uploadHospitals, changePassword}