import express from 'express';
const router = express.Router();

// Auth
import userAuth from "../middlewares/userAuth.middleware.js";

// Controllers
import {login, verifyOtp, updateProfile, getProfile, logout, refreshTokens} from '../controllers/user.controller.js';


router.route("/login")
    .post(login)

router.route("/verifyotp")
    .post(verifyOtp)

router.route("/profile")
    .post(userAuth, updateProfile)
    .get(userAuth, getProfile)

router.route("/logout")
    .post(userAuth, logout)

router.route("/refreshtoken")
    .post(refreshTokens)

export default router;