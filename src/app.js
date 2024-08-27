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

app.get("/review",async (req, res)=>{

    const data = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': `${process.env.GOOGLE_API_KEY}`,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
        },
        body: JSON.stringify({textQuery: "Fortis Hospital, 14, Cunningham Rd, Vasanth Nagar, Bengaluru, Karnataka 560052"})

    })

    const jsonData = await data.json();

    res.send(jsonData);



})

// Routers
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import hospitalRoute from "./routes/hospital.route.js";
import diseaseRoute from "./routes/disease.route.js";


app.use("/admin", adminRoute);
app.use("/user", userRoute);
app.use("/hospital", hospitalRoute);
app.use("/disease", diseaseRoute);

export default app;