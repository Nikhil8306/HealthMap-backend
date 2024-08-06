import express from 'express';
const router = express.Router();

// Controllers
import {login, changePassword} from "../controllers/admin.controller.js";

// Middlewares
import adminAuth from "../middlewares/adminAuth.middleware.js";

router.route("/login")
    .post(login)

router.route("/password")
    .put(adminAuth, changePassword);

export default router;