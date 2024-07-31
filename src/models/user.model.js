import mongoose from "mongoose";

const UserSchema = mongoose.Schema({

    mobile:{
        type:String,
        required:true,
    },

    password:{
        type:String,
        required:true,
    },

    age:{
        type:Number,
    },

    gender:{
        type:String,
    },

    address:{
        type:String,
    },

    disease:[{
        type:String,
    }],

    refreshToken:{
        type:String,
    }

})

const User = mongoose.model("User", UserSchema);

export default User;