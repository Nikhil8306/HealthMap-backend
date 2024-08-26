import express from "express"
const router = express.Router()

import upload from "../middlewares/multer.middleware.js";

// Controllers
import {uploadBlogs, searchBlog, getBlog} from "../controllers/disease.controller.js";

// Middlewares
import adminAuth from "../middlewares/adminAuth.middleware.js";

router.route("/")
    .post(upload.any(), uploadBlogs)
    .get(getBlog)

router.route("/search")
    .get(searchBlog)

export default router;