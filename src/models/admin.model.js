import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
    },

    password:{
        type: String,
        required:true,
    },

    refreshToken:{
        type: String,
    }
})

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;