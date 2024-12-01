// connect your application to cloudinary
// establish connection with cloudinary

const cloudinary=require("cloudinary").v2;
require("dotenv").config();

function cloudinaryconnect(){
    try{
        cloudinary.config({
            cloud_name:process.env.CLOUD_NAME,
            api_key:process.env.API_KEY,
            api_secret:process.env.API_SECRET
        })

        console.log("connected to cloudinary");
    } 
    catch(error){
        console.log(error);
    }
}

module.exports=cloudinaryconnect;