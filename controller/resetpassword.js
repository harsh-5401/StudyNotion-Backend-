
const mailsender=require("../utillities/mailsender");
const User = require("../models/user");
const bcrypt=require("bcrypt");
const crypto=require("crypto");


// reset passowrd token => purpose to send mail

async function resetpasswordtoken(req,res){
    try{
        // fetch email from req.body
        const {email}=req.body;

        // validate email
        // check user for this email
        const user=await User.findOne({email:email});
        
        if(!user){
            return res.json({
                success:false,
                message:"your email is not registered with us"

            })
        }

        // generate token 
        const token=crypto.randomUUID();

        // update user by adding token and expiration time
        const updateddetails=await User.findOneAndUpdate({email:email} , {
            token:token,
            resetpasswordexpires:Date.now()+5*60*1000,
        } , {new:true});       /// new=true returns updated document

        // creeate url 
        const url=`http://localhost:3000/update-password/${token}`

        // send mail containing url
        await mailsender(email , "password reset link" , `password reset link ${url}`);

        // return response
        return res.json({
            success:true,
            message:"email send succesfully please check email and change password",
            updateddetails
        });
        

    } catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:"something went wrong while sending reset password mail"
        });
    }
}

//reset password

async function resetpassword(req,res){
    try{
        // fecth data
       
        const{password , confirmpassword , token} = req.body;
        // validation
        if(password!==confirmpassword){
            return res.json({
                success:false,
                message:"password not matching",
            })
        }
        // get user details from db using token
        const userdetails=User.findOne({token:token});

        // if no entry invlaid token
        if(!userdetails){
            return res.json({
                success:false,
                message:"no user for this token"
            })
        }
        // if time expires - invalid token
        if(userdetails.resetpasswordexpires < Date.now() ) {
            return res.json({
                success:false,
                message:"link or token expired generate link again"
            })
        }

        // hash new password
        const hashedpassword=await bcrypt.hash(password , 10);

        // update it into db
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedpassword},
            {new:true}
        )
        // return response
        
        return res.status(200).json({
            success:true,
            message:"password reset succesful"
        })

    } catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:"something went wrong while sending reset password mail"
        });
    }
}


module.exports={resetpasswordtoken , resetpassword}