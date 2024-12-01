
const mongoose=require("mongoose");
const mailsender = require("../utillities/mailsender");

const otpschema=new mongoose.Schema(
    {

        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },

        email:{
            type:String,
            required:true,

        },
        
        otpvalue:{
            type:String,
            required:true,
        },

        createdAT:{
            type:Date,
            // required:true,
            default:Date.now(),
            expires:5*60*1000
        }


    }
);

// pre middleware for sending otp because we need to send otp before user is regsitered in db 
// after verifying mail we need to creat entry of user in db

// a function -> to send email

async function sendverificationemail(email , otp) {
    try{

        const mailresponse=await mailsender(email , "verification email from study Notion" , otp);
        console.log("mailresponse=" , mailresponse);

    } catch(error){
        console.log(error);
        console.log("error occured while sending mail");
        throw error;

    }
}

// pre middleware 
// just before document is saved send verification email with this data after this 
// move to next middleware

otpschema.pre("save" , async function (next) {
    await sendverificationemail(this.email , this.otpvalue);
    next();
} )

module.exports=mongoose.model("Otpmodel" , otpschema);