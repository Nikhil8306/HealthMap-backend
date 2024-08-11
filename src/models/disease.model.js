import mongoose from "mongoose";

const DiseaseSchema = mongoose.Schema({
    name: String,
    description: String,
})

const Disease = mongoose.model("Disease", DiseaseSchema);

export default Disease;