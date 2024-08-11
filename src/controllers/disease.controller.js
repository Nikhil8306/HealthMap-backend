import Disease from "../models/disease.model.js";
import mammoth from "mammoth-styles";
import apiResponse from "../utils/apiResponse.js";
import fs from "fs";

const uploadBlogs = async (req, res) => {
    try{

        if (!req.files){
            return res
                .status(400)
                .json(apiResponse(400, {}, "No file found"));
        }

        for(let i = 0; i < req.files.length; i++){
            const name = req.files[i].filename.split("-")[0];

            const html = await mammoth.convertToHtml({path: req.files[i].path});
            const newBlog = await Disease.create({
                name: name,
                description:html.value
            })

            fs.unlinkSync(req.files[i].path);
        }

        return res
            .status(200)
            .json(apiResponse())
    }
    catch(err){
        console.log("Error while uploading blogs: ", err);
        return res.status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const searchBlog = async (req, res)=>{
    try{

        const {query} = req.query;

        if (!query) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send Query"));
        }

        const regex = new RegExp(query,'i');

        const result = await Disease.find({
            name:regex
        }).select("_id name");

        return res
            .status(200)
            .json(apiResponse(200, {result}));
    }

    catch(err){
        console.log("Error while getting blog: ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

const getBlog = async(req, res)=>{
    try{

        const {blogId} = req.query;
        if (!blogId) {
            return res
                .status(400)
                .json(apiResponse(400, {}, "Send blog id"));
        }

        const blog = await Disease.findById(blogId);
        if (!blog){
            return res
                .status(400)
                .json(apiResponse(400, {}, "No blog found"));
        }

        return res
            .status(200)
            .json(apiResponse(200, {blog}));

    }
    catch(err){
        console.log("Error while getting blog: ", err);
        return res
            .status(500)
            .json(apiResponse(500, {}, "Something went wrong"));
    }
}

export {uploadBlogs, searchBlog, getBlog}