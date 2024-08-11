import fs from 'fs';
import {Worker} from "worker_threads";

// Models
import Hospital from "../models/hospital.model.js";

// Utils
import apiResponse from "../utils/apiResponse.js";


const parserPath = "./src/xlsxParser.js";


const uploadHospitals = async (req, res)=>{
    try{
        if (!req.files) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "No file found"));
        }
        const filePath = req.files[0].path;

        const parserWorker = new Worker(parserPath, {workerData : {filePath: filePath}});

        parserWorker.on("message", async (data)=>{
                console.log("Got the data")
                try{
                    for (let i = 0; i < data.length; i++) {
                        if (!data[i]["S.No"] || data[i]["S.No"] === "") continue;
                        if (await Hospital.findOne({sNo: data[i]["S.No"]})) continue;

                        let rating = Math.random()*6;
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
                            rating:rating,
                            doctors: data[i]["Doctors"],
                            images:data[i]["Images"]
                        })
                    }
                    fs.unlinkSync(filePath)

                    return res
                        .status(200)
                        .json(apiResponse());
                }

                catch(err){
                    fs.unlinkSync(filePath)

                    console.log("Error while uploading hospitals : ", err)
                    return res
                        .status(500)
                        .json(apiResponse(500, {}, "Something went wrong"));
                }

            }
        )

    }
    catch (err){
        fs.unlinkSync(filePath)
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

const postReview = async(req, res)=>{
    try{
        const {hospitalId, review} = req.body;
        if (!hospitalId || !review) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send hospitalId and review."));
        }

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Hospital not found"));
        }

        for(let i = 0; i < hospital.reviews.length; i++){
            if (hospital.reviews[i].user.equals(req.user._id)){
                hospital.reviews.splice(i, 1);
            }
        }

        hospital.reviews.push({user:req.user._id, review:review});

        await hospital.save();

        return res.status(200).json(apiResponse());
    }
    catch(err){
        console.log("Error while writing review : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"))
    }
}

const hospitalSearch = async(req, res)=>{
    try{

        const {query, filters} = req.body;
        if (!query || !filters) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send query and filters"));
        }

        const regex = new RegExp(query,'i');
        const minRatings = (filters.rating?filters.rating:1);
        const location = filters.location?filters.location:"";
        const locationRegex = new RegExp(location,'i');

        const results = await Hospital.find({
            $and:[
                {
                    $or: [
                        {name: regex},
                        {"specialities.subfields": {$regex: regex}}
                    ]
                },
                {
                    rating:{$gte: minRatings},
                },
                {
                    address:{$regex:locationRegex}
                }

            ]

        }).select("name address specialities")

        const hospitals = [];

        for(let i = 0; i < results.length; i++){
            const hospital = {};

            hospital.name = results[i].name;
            hospital.address = results[i].address;

            const specialties = results[i].specialities;
            let treatments = [];
            for(let j = 0; j < specialties.length; j++){
                const subFields = specialties[j].subfields;
                for(let k = 0; k < subFields.length; k++){
                    const subField = subFields[k];
                    if (subField.match(regex)){
                        treatments.push(subField);
                    }
                }
            }
            hospital.treatments = treatments;

            hospitals.push(hospital);
        }


        return res
            .status(200)
            .json(apiResponse(200, {
                hospitals
            }))
    }
    catch(err){
        console.log("Error while searching hospitals : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const getHospital = async(req, res)=>{
    try{

        const {hospitalId} = req.body;
        if (!hospitalId) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send hospital id"));
        }

        const hospital = await Hospital.findById(hospitalId).select("name address beds images bookingLink website email contact1 contact2 emergency amenities specialities.speciality rating");

        if (!hospital) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "No such hospital found"));
        }

        return res
            .status(200)
            .json(apiResponse(200, {hospital}));


    }
    catch(err){
        console.log("Error while getting hospital data : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const getFullHospital = async(req, res)=>{
    try{

        const {hospitalId} = req.body;
        if (!hospitalId) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send hospital id"));
        }

        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "No such hospital found"));
        }

        return res
            .status(200)
            .json(apiResponse(200, {hospital}));

    }
    catch(err){
        console.log("Error while getting hospital data : ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}
export {uploadHospitals, deleteHospital, postReview, hospitalSearch, getHospital, getFullHospital};