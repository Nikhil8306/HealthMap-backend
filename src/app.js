import express from "express"
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get("/helloworld", (req, res)=>{
    res.send("Hello World")
})

// Routers
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js"

app.use("/admin", adminRoute);
app.use("/user", userRoute);

export default app;