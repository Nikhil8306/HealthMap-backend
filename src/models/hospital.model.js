import mongoose from "mongoose";


const hospitalSubSchema = new mongoose.Schema({
    speciality:{
        type:String,
    },
    subfields: [{
        type: String,
    }],
    cost: [{
        type:String,
    }]
}, { _id: false });

const doctorSubSchema = new mongoose.Schema({
    speciality:{
        type:String,
    },
    doctors:[{
        name:String,
        contact:String,
        image:String,
    }]
}, { _id: false })

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
    images:[{
        type:String,
    }],
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
        type:[hospitalSubSchema]
    },
    placeId:{
        type:String,
    },
    rating:{
        type:Number,
    },
    doctors:{
      type:[doctorSubSchema],
    },
    reviews:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
        },
        userName: {
            type:String
        },
        review:{
            type: String,
        }
    }, { _id: false }]
})


const HospitalModel = mongoose.model("Hospital", hospitalSchema);

export default HospitalModel;