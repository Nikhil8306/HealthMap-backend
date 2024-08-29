import fs from 'fs';
import {Worker} from "worker_threads";
import axios from 'axios'

// Models
import Hospital from "../models/hospital.model.js";
import User from "../models/user.model.js";

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
                        if (!data[i]["S.No"] || data[i]["S.No"] === "" || !data[i]["Hospital Name"]) continue;
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
                            placeId:data[i]["placeId"],
                            rating:data[i]["rating"],
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
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

                    console.log("Error while uploading hospitals : ", err)
                    return res
                        .status(500)
                        .json(apiResponse(500, {}, "Something went wrong"));
                }

            }
        )

        parserWorker.on("error", (err)=>{
            console.log(err);
            console.log("Error while parsing the file")
            return res
                .status(500)
                .json(apiResponse(500, {}, "Something went wrong"));
        })

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

        let name = "User";
        const currUser = await User.findById(req.user._id);
        if (currUser.name) name = currUser.name;

        hospital.reviews.push({user:req.user._id, userName:name, review:review});

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

        const {query, page, rating, place} = req.query;
        if (!query) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send query"));
        }

        if (!page){
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send Page Number"));
        }

        const regex = new RegExp(query,'i');
        const minRatings = (rating?rating:1);
        const location = place?place:"";
        const locationRegex = new RegExp(location,'i');

        const limit = 10;
        const skip = (page - 1) * limit;


        let results = await Hospital.find({
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

        }).sort("-rating").skip(skip).limit(limit).select("_id name address specialities images")

        const pageCount = Math.ceil((await Hospital.find({
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

        })).length/10);

        results = results

        const hospitals = [];

        for(let i = 0; i < results.length; i++){
            const hospital = {};

            hospital._id = results[i]._id;
            hospital.name = results[i].name;
            hospital.address = results[i].address;
            hospital.images = results[i].images;

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
                hospitals,
                pageCount
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

        const {hospitalId} = req.query;
        if (!hospitalId) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send hospital id"));
        }

        let hospital = await Hospital.findById(hospitalId).select("name placeId rating reviews address beds images bookingLink website email contact1 contact2 emergency amenities specialities.speciality doctors");
        
        const url = 'https://maps.googleapis.com/maps/api/place/details/json';

        const params = {
            place_id: hospital.placeId,
            fields: 'reviews',
            key: process.env.GOOGLE_API_KEY
        };
        const hospitalReviews = hospital.reviews;
    
        const hospitalDetails =  (await axios.get(url, { params })).data.result;

        const newReviews = [];

        for(let i = 0; i < Math.min(5, hospitalDetails.reviews.length); i++){
            newReviews.push({userName:hospitalDetails.reviews[i].author_name, review:hospitalDetails.reviews[i].text, image:hospitalDetails.reviews[i].profile_photo_url});
        }

        hospital.reviews = newReviews.concat(hospitalReviews.splice(0, Math.min(hospitalReviews.length, 5)));

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

        const {hospitalId} = req.query;
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