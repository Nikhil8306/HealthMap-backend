import mongoose from "mongoose";


const SubSchema = new mongoose.Schema({
    speciality:{
        type:String,
    },
    subfields: [{
        type: String,
    }]
}, { _id: false });

const hospitalSchema = mongoose.Schema({
    sNo:{
        type:String,
        required:true,
        unique:true,
    },
    address:{
        type:String,
    },
    beds:{
        type:String,
    },
    name:{
        type:String,
        required:true,
    },
    bookingLink:{
        type:String,
    },
    website:{
        type:String,
    },
    email:{
        type:String
    },
    contact1:{
        type:String,
    },
    contact2:{
        type:String,
    },
    emergency:{
        type:String,
    },
    amenities:[{
        type:String,
    }],
    specialities:{
        type:[SubSchema]
    }
})


const HospitalModel = mongoose.model("Hospital", hospitalSchema);

export default HospitalModel;