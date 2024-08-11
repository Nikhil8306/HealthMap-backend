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



import XLSX from "xlsx";
import ExcelJS from "exceljs";
import {uploadImage} from "./utils/cloudinary.js";
import upload from "./middlewares/multer.middleware.js";
import fs from "fs"
app.post("/imageHospital", upload.any(), async (req, res)=>{

    const filePath = req.files[0].path;
    const data = XLSX.readFile(req.files[0].path);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(data.SheetNames[0]);


    // const media = worksheet._media;
    // console.log(worksheet._workbook.media)
    // console.log(media)
    // fs.writeFileSync("./public/temp/image.jpg", worksheet._workbook.media[0].buffer)
    // console.log(media[0].range.tl.worksheet._media)
    // console.log(worksheet._workbook.media[0]) // Easy buffer access
    // console.log(media[0].worksheet._workbook.media);
    // console.log(media[0].worksheet._media[0]);

    // for(let i = 0; i < media.length; i++){
    //     let row = media[i].range.tl.nativeRow;
    //     let col = media[i].range.tl.nativeCol;
    //
    //     console.log(row, col);
    // }

    for (const image of worksheet.getImages()) {
        console.log('processing image row', image.range.tl.nativeRow, 'col', image.range.tl.nativeCol, 'imageId', image.imageId);
        // fetch the media item with the data (it seems the imageId matches up with m.index?)
        const img = workbook.model.media.find(m => m.index === image.imageId);
        fs.writeFileSync(`./public/temp/${image.range.tl.nativeRow}.${image.range.tl.nativeCol}.${img.name}.${img.extension}`, img.buffer);
    }




    res.send("Hello");

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