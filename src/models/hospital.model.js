import mongoose from "mongoose";

const hospitalSchema = mongoose.Schema({

    sNo:{
        type:String,
        required:true,
    },
    Address:{
        type:String,
    },
    Beds:{
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
    Contact2:{
        type:String,
    },
    emergency:{
        type:String,
    },
    amenities:[{
        type:String,
    }],
    specialities:{
        name:[{
            type:String,
        }]
    }

})

const HospitalModel = mongoose.model("Hospital", hospitalSchema);

export default HospitalModel;