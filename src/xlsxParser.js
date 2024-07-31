import {parentPort, workerData} from 'worker_threads';

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
    
    for(let i = ascii.length-1; i >= 0 && rem == 1; i--){
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

function xlsxParserUtil(sheet){

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
    }
    let count = 12;

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
        data[cell] = getValue(sheet, rightCell(fields[cell]));
    }


    let amenities = [];

    let amenitiesCell = rightCell(fields["Amenities"]);
    let specialitiesCell = downCell(fields["Specialities"]);


    while(sheet.hasOwnProperty(amenitiesCell)){
        amenities.push(...getDownData(sheet, amenitiesCell));
        amenitiesCell = rightCell(amenitiesCell);
    }

    data["Amenities"] = amenities;

    
    const Specialities = {}

    while(sheet.hasOwnProperty(specialitiesCell)){
        const name = getValue(sheet, specialitiesCell);

        const dis = getDownData(sheet, downCell(specialitiesCell));

        Specialities[name] = dis;

        specialitiesCell = rightCell(specialitiesCell);
    }

    data["Specialities"] = Specialities;

    return data;

}

function xlsxParser(sheets){
    const data = [];
    for(let i = 0; i < sheets.length; i++){
        const sheetName = sheets.SheetNames[i];
        data.push(xlsxParserUtil(sheets.Sheets[sheetName]));
    }

    return data;
}

console.log("HEllo there")

const data = xlsxParser(workerData.sheets);

parentPort.postMessage(data);