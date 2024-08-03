import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";


import mongoose from "mongoose";
import { initializeClient } from "./src/utils/sms.js";

import cors from "cors";
app.use(cors());


mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Database Connected");
    app.listen(process.env.PORT, ()=>{
        console.log("Server running at port : ", process.env.PORT);
    })

    initializeClient();
})
.catch((err)=>{
    console.log("Error connecting to Database: ", err);
})