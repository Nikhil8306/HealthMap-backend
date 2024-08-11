import express from 'express';
const router = express.Router();

import upload from "../middlewares/multer.middleware.js";

// Controllers
import {uploadHospitals, deleteHospital, postReview, hospitalSearch, getHospital, getFullHospital} from "../controllers/hospital.controller.js";

// Middlewares
import adminAuth from "../middlewares/adminAuth.middleware.js";
import userAuth from "../middlewares/userAuth.middleware.js";

router.route("/")
    .get(getHospital)
    .post( upload.any(),  uploadHospitals)
    .delete(adminAuth, deleteHospital)

router.route("/data")
    .get(adminAuth, getFullHospital)

router.route("/review")
    .post(userAuth, postReview);

router.route("/search")
    .get(hospitalSearch)




export default router