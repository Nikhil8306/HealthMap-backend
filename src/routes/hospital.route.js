import express from 'express';
const router = express.Router();

import multer from "multer";
const upload = multer({dest:"../xlsx/"});

// Controllers
import {uploadHospitals, deleteHospital} from "../controllers/hospital.controller.js";

// Middlewares
import adminAuth from "../middlewares/adminAuth.middleware.js";


router.route("/")
    .post(adminAuth, upload.single("hospitals"),  uploadHospitals)
    .delete(adminAuth, deleteHospital)



export default router