import {parentPort, workerData} from 'worker_threads';
import {uploadImage, uploadImageStream} from "./utils/cloudinary.js";
import fs from "fs";
import ExcelJS from "exceljs";
import XLSX from "xlsx";
import axios from "axios"
import fetch from "node-fetch"


function locToCell(row, col){
    if (col <= 0)
        return ''

    let result = ""
    while (col) {
        let t = col % 26
        if (!t) {
            t = 26
            --col
        }
        result += String.fromCodePoint(t + 64)
        col = ~~(col / 26)
    }

    result += String(row);

    return result;
}


function rightCell(currCell){
    const ascii = [];
    let numStart = 1;
    for(let i = 0; i < currCell.length; i++){
        if (currCell[i] >= '0' && currCell[i] <= "9") {
            numStart = i;
            break;
        }
        ascii.push(currCell.charCodeAt(i)-65);
    }

    let rem = 1;
    
    for(let i = ascii.length-1; i >= 0 && rem === 1; i--){
        let newAscii = rem+ascii[i];

        rem = parseInt(newAscii/26);
        ascii[i] = newAscii%26;
    }

    let newCell = "";
    if (rem == 1) newCell += "A";


    for(let i = 0; i < ascii.length; i++){
        ascii[i] += 65;
    }

    newCell += String.fromCharCode(...ascii)

    newCell += currCell.substring(numStart, currCell.length+1);
    return newCell;

}


function downCell(currCell){
    let num = 0;
    let word = "A";
    for(let i = 0; i < currCell.length; i++){
        if (currCell[i] >= "0" && currCell[i] <= "9"){
            word = currCell.substring(0, i);
            num = parseInt(currCell.substring(i, currCell.length+1));
            break;
        }
    }

    num++;


    word += String(num);

    return word;
}

function getValue(sheet, currCell){
    return sheet[currCell]["v"];
}

function getDownData(sheet, currCell){
    const data = [];

    while(sheet.hasOwnProperty(currCell)){
        data.push(getValue(sheet, currCell));
        currCell = downCell(currCell);
    }

    return data;
}

function getDownDataRange(sheet, currCell, range){
    const data = [];

    while(range > 0){
        range--;
        if (!sheet.hasOwnProperty(currCell)) data.push(null);
        else data.push(getValue(sheet, currCell));
        currCell = downCell(currCell);
    }

    return data;
}

const xlsxParserUtil = async (sheet, imageData)=>{

    const fields = {
        "S.No":"",
        "Address":"",
        "Beds":"",
        "Hospital Name":"",
        "Booking Link":"",
        "Website":"",
        "e-mail":"",
        "Contact 1":"",
        "Contact 2":"",
        "Emergency":"",
        "Amenities":"",
        "Specialities":"",
        "Doctors":"",
        "Images":"",
    }
    let count = 14;

    for(const cell in sheet){
        if (count <= 0) break;
        
        let field = String(sheet[cell]["v"]);

        // console.log(field);
        if (field){
            field = field.trim();
            if (fields.hasOwnProperty(field)){
                count--;
                fields[field] = cell;
            }
        }
        
    }

    const data = {
        "S.No":"",
        "Address":"",
        "Beds":"",
        "Hospital Name":"",
        "Booking Link":"",
        "Website":"",
        "e-mail":"",
        "Contact 1":"",
        "Contact 2":"",
        "Emergency":"",
    }

    for(const cell in data){
        const dataCell = rightCell(fields[cell]);
        if (sheet.hasOwnProperty(dataCell)) data[cell] = getValue(sheet, dataCell);

    }


    let amenities = [];

    let amenitiesCell = rightCell(fields["Amenities"]);
    let specialitiesCell = downCell(fields["Specialities"]);

    if (fields["Amenities"] !== ""){

        while(sheet.hasOwnProperty(amenitiesCell)){
            amenities.push(...getDownData(sheet, amenitiesCell));
            amenitiesCell = rightCell(amenitiesCell);
        }

        data["Amenities"] = amenities;
    }   

    if (fields["Specialities"] !== ""){
        const Specialities = []
        while(sheet.hasOwnProperty(specialitiesCell)){
            const name = getValue(sheet, specialitiesCell);

            const dis = getDownData(sheet, downCell(specialitiesCell));

            const obj = {}
            obj["speciality"] = name;
            obj["subfields"] = dis;
            specialitiesCell = rightCell(specialitiesCell);
            obj["cost"] = getDownDataRange(sheet, downCell(specialitiesCell), obj["subfields"].length);
            Specialities.push(obj);
            specialitiesCell = rightCell(specialitiesCell);
        }

        data["Specialities"] = Specialities;
    }


    if (fields["Doctors"] != ""){

        let doctorCell = downCell(fields["Doctors"]);
        const doctorData = []
        while(sheet.hasOwnProperty(doctorCell)){
            const spec = getValue(sheet, doctorCell);

            let currCell = downCell(doctorCell);

            const doctors = []

            while(sheet.hasOwnProperty(currCell)){
                // console.log(currCell)
                const name = getValue(sheet, currCell);
                currCell = downCell(currCell);
                let imageUrl = "";
                if (imageData.hasOwnProperty(currCell)){
                    const suffix = "image-"+Date.now() +"-"+ Math.round(Math.random() * 1E9)
                    const outputFilePath = "public/temp/" + suffix;
                    try{
                        fs.writeFileSync(outputFilePath, imageData[currCell]);
                        imageUrl = await uploadImage(outputFilePath)
                        fs.unlinkSync(outputFilePath);
                    }
                    catch(err){
                        fs.unlinkSync(outputFilePath);
                        console.log("Error while uploading file: ", err);
                    }

                }
                currCell = downCell(currCell);
                const contact = sheet.hasOwnProperty(currCell)?getValue(sheet, currCell):null;
                currCell = downCell(currCell);

                doctors.push({name, contact, image:imageUrl});
            }
            doctorCell = rightCell(doctorCell)
            doctorData.push({speciality:spec, doctors});
        }
        data["Doctors"] = doctorData;

    }

    if (fields["Images"] != ""){
        const images = [];
        let imageCell = downCell(fields["Images"]);

        while(imageData.hasOwnProperty(imageCell)){
            let currImageCell = imageCell;
            while(imageData.hasOwnProperty(currImageCell)){
                const suffix = "image-"+Date.now() +"-"+ Math.round(Math.random() * 1E9)
                const outputFilePath = "public/temp/" + suffix;
                try{
                    fs.writeFileSync(outputFilePath, imageData[currImageCell]);
                    const imageUrl = await uploadImage(outputFilePath)
                    images.push(imageUrl);
                    fs.unlinkSync(outputFilePath);
                }
                catch(err){
                    fs.unlinkSync(outputFilePath);
                    console.log("Error while uploading file: ", err);
                }
                currImageCell = downCell(currImageCell);
            }
            imageCell = rightCell(imageCell);
        }

        data["Images"] = images;
    }


    return data;

}

const getPlaceId= async(hospitalName)=>{
    const data = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': `${process.env.GOOGLE_API_KEY}`,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
        },
        body: JSON.stringify({textQuery: hospitalName})
    })

    const jsonData = await data.json();
    return jsonData.places[0].id;
}

const getRatingAndImages = async (hospitalId)=>{
    const url = 'https://maps.googleapis.com/maps/api/place/details/json';

    const params = {
        place_id: hospitalId,
        fields: 'rating,photos',
        key: process.env.GOOGLE_API_KEY
    };

    const hospitalDetails =  (await axios.get(url, { params })).data.result;
    // console.log(hospitalDetails);
    
    const hospital = {
        rating:hospitalDetails.rating,
        photos:hospitalDetails.photos
    }
    return hospital
    
}


const xlsxParser = async(sheets, workbook)=>{
    const data = [];

    let length = sheets.SheetNames.length;

    for(let i = 0; i < length; i++){
        let sheetName = sheets.SheetNames[i];

        const worksheet = workbook.getWorksheet(sheetName);
        const imagesData = {};
        for (const image of worksheet.getImages()) {
            const img = workbook.model.media.find(m => m.index === image.imageId);
            imagesData[locToCell(image.range.tl.nativeRow+1, image.range.tl.nativeCol+1)] = img.buffer;
        }

        let currData = await xlsxParserUtil(sheets.Sheets[sheetName], imagesData)
        const placeId = await getPlaceId(currData["Hospital Name"]);
        if (!placeId) continue;
        const {rating, photos} = await getRatingAndImages(placeId);
        currData["rating"] = rating;
        currData["placeId"] = placeId;
        if (!currData["Images"] || currData["Images"].length == 0){
            const images = []
            if (!photos) continue;
            for(let a = 0; a < Math.min(photos.length, 10); a++){
                const photoReference = photos[a].photo_reference; // Get the first photo reference
                const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1500&photoreference=${photoReference}&key=${process.env.GOOGLE_API_KEY}`;
                
                const res = await fetch(photoUrl);
                images.push(await uploadImageStream(res.body));
            }

            // console.log(images);
            currData["Images"] = images;
        }
        data.push(currData);
    }
    return data;
}

const xlsxSheets = XLSX.readFile(workerData.filePath);
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workerData.filePath);

xlsxParser(xlsxSheets, workbook).then(data=>parentPort.postMessage(data))