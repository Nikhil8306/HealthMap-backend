import mongoose from "mongoose";

const DiseaseSchema = mongoose.Schema({
    name: String,
    description: String,
})