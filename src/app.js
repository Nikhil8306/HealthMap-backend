import express from "express"
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

import cors from "cors";
app.use(cors({
    origin:"*"
}));

app.get("/helloworld", (req, res)=>{
    res.send("Hello World")
})


app.post("/testupload", upload.any(), async (req, res)=>{
    const filePath = req.files[0].path;
    console.log(filePath)
    const url = await uploadImage(filePath);

    res.send(url)
})

// Routers
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import hospitalRoute from "./routes/hospital.route.js";

app.use("/admin", adminRoute);
app.use("/user", userRoute);
app.use("/hospital", hospitalRoute);

export default app;