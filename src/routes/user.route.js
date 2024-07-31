import express from 'express';
const router = express.Router();


// Controllers
import { register, verifyOtp } from '../controllers/user.controller.js';


router.route("/register")
.post(register)

router.route("/verifyotp")
.post(verifyOtp)





export default router;