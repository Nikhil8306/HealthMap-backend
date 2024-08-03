import mongoose from "mongoose";

const UserSchema = mongoose.Schema({

    mobile:{
        type:String,
        required:true,
    },

    name:{
        type:String,
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

    diseases:[{
        type:String,
    }],

    refreshToken:{
        type:String,
    }

})

const User = mongoose.model("User", UserSchema);

export default User;