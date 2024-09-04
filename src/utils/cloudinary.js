import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name:"dj68cidmu",
    api_key:"979693359235241",
    api_secret:"ojq4GLFuewu3EWiQXAJ_niPVaDE",
})


const uploadImage = async (filePath)=>{
   try{
       if (!filePath) {
           return null;
       }

       const upload = await cloudinary.uploader.upload(filePath, {
           fileType:"auto",
       });

       return upload.url;
   }
   catch(err)
   {
       console.log("Error uploading on cloud : ", err);
       return null;
   }
}

const uploadImageStream = async (stream)=>{
    try{
        if (!stream) return null;

        return new Promise((resolve, reject) => {
            const cloudinaryUploadStream = cloudinary.uploader.upload_stream(
                { },
                (error, result) => {
                    if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(error);
                    }
                }
            );
            stream.pipe(cloudinaryUploadStream);
        });

    }
    catch(err){
        console.log("Error uploading on cloud : ", err);
       return null;
    }
}

export {uploadImage, uploadImageStream};