import express from 'express';
import {login} from "../controllers/admin.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";

import multer from "multer";
const upload = multer({dest:"../xlsx/"});

const router = express.Router();



router.route("/login")
.post(login)

router.route("/hospital")
    .post(adminAuth, upload.single("hospitals"),  (req, res) => {

    })

export default router;