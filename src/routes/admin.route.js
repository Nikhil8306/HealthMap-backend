import express from 'express';

import multer from "multer";
const upload = multer({dest:"../xlsx/"});

const router = express.Router();

// Controllers
import {login, uploadHospitals, changePassword} from "../controllers/admin.controller.js";

// Middlewares
import adminAuth from "../middlewares/adminAuth.middleware.js";

router.route("/login")
    .post(login)

router.route("/hospital")
    .post(adminAuth, upload.single("hospitals"),  uploadHospitals)

router.route("password")
    .put(adminAuth, changePassword);

export default router;