import XLSX from "xlsx";
import {Worker} from "worker_threads";

// Models
import Hospital from "../models/hospital.model.js";

// Utils
import apiResponse from "../utils/apiResponse.js";


const parserPath = "./src/xlsxParser.js";


const uploadHospitals = async (req, res)=>{
    try{
        if (!req.file) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "No file found"));
        }
        const data = XLSX.readFile(req.file.path);

        const parserWorker = new Worker(parserPath, {workerData : {sheets: data}});

        parserWorker.on("message", async (data)=>{
                try{
                    for (let i = 0; i < data.length; i++) {
                        if (!data[i]["S.No"] || data[i]["S.No"] === "") continue;
                        if (await Hospital.findOne({sNo: data[i]["S.No"]})) continue;
                        const newHospital = await Hospital.create({
                            sNo: data[i]["S.No"],
                            address: data[i]["Address"],
                            beds: data[i]["Beds"],
                            name: data[i]["Hospital Name"],
                            bookingLink: data[i]["Booking Link"],
                            website: data[i]["Website"],
                            email: data[i]["e-mail"],
                            contact1: data[i]["Contact 1"],
                            contact2: data[i]["Contact 2"],
                            emergency: data[i]["Emergency"],
                            amenities: data[i]["Amenities"],
                            specialities: data[i]["Specialities"],
                        })
                    }

                    return res
                        .status(200)
                        .json(apiResponse());
                }

                catch(err){
                    console.log("Error while uploading hospitals : ", err)
                    return res
                        .status(500)
                        .json(apiResponse(500, {}, "Something went wrong"));
                }
        }
        )
    }
    catch (err){
        console.log("Error while uploading hospitals : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const deleteHospital = async(req, res)=>{
    try{
        const {hospitalId, sNo} = req.body;
        if (!hospitalId && !sNo) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send hospitalId or hospital S.No."));
        }

        const search = {};

        if (hospitalId) search._id=hospitalId;
        else search.sNo = sNo;

        const deletedHospital = await Hospital.findOneAndDelete(search);

        if (!deletedHospital) {
            return res.
            status(400)
                .json(apiResponse(400, {}, "Hospital not found"));
        }

        return res.status(200).json(apiResponse());

    }
    catch(err){
        console.log("Error while removing hospital : ", err);

        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const hospitalSearch = async(req, res)=>{
    try{

        const {input} = req.body;


    }
    catch(err){
        console.log("Error while searching hospitals : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}


export {uploadHospitals, deleteHospital};