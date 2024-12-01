//HW : WRITE CHANGE PASSWORD CONTROLLER

const User=require("../models/user");
const Otpmodel=require("../models/otp");
const otpgenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const profilemodel=require("../models/profile")
require("dotenv").config();


// send otp

async function sendotp(req,res){

    try{

        //fetech email 
        const {email}=req.body;

        // check if user present if exist return response

        const checkuserPresent=await User.findOne({email});

        if(checkuserPresent){
            return res.status(401).json({
                success:false,
                message:"user already exist"
            });
        }

        //generate otp

        var otp=otpgenerator.generate(6 , {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        // make sure you have generated unique otp
        // for this keep checkking entry in db until you find unique otp

        let result=await Otpmodel.findOne({otpvalue:otp});

        // thhis is brute forcre not very good practice

        while(result){
            otp = otpgenerator.generate(6 , {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });

            result=await Otpmodel.findOne({otpvalue:otp});
        }

        const otpPayload={email, otp};

        // creat an entry in db

        const otpbody=await Otpmodel.create({
            email:email,
            otpvalue:otp
        });
        console.log("otpbody=>" , otpbody);
       

        // return succesful response

        res.status(200).json({
            success:true,
            message:"otp send successfully",
            otpbody
        });


    } catch(error){

        console.log(error);
        res.status(500).json({
            success:false,
            // message:error.message,
            message:"unbale to send otp"
        })
    }
    

}



// sign up  

async function signup(req,res){

    try{

    // fetch data

    const  {firstname , lastname , accounttype , password  , confirmpassword, email , otp , contactnumber }=req.body;

    // validate data 
    if(!firstname || !lastname || !email || !password || !confirmpassword || !otp ){
        return res.status(401).json({
            success:false,
            message:"all fields are required"
        });
    }

    // compare both passwords
    if(password!==confirmpassword){
        return res.status(400).json({
            success:false,
            message:"password and confirm password do not match"
        });
    }

    // check if user exist or not
    
    const existinguser=await User.findOne({email:email});
    console.log("existing user is=" , existinguser);
    if(existinguser){
        return res.status(400).json({
            success:false,
            message:"user is already registered"
        });
    }

    // find most recent otp for user
    const recentotp=await Otpmodel.find({email:email}).sort({createdAt :-1}).limit(1);
    console.log("recent otp=" , recentotp);

    // validate otp
    if(recentotp.length === 0) {
        // otp not found
        return res.status(400).json({
            success:false,
            message:"otp not found"
        });
    } else if(otp!==recentotp[0].otpvalue){
        // invalid otp
        return res.status(400).json({
            success:false,
            message:"wrong otp"
        });
    }

    // hash password

    const hashedpassword=await bcrypt.hash(password,10);

    // creat entry in db

    // account detail contain id of profile so we need to creat profile first in db
    // and then assign its id to additonal details 

    const profiledetails=await profilemodel.create({
        gender:null,
        dateofbirth:null,
        About:null,
        number:contactnumber,
    });

    const user=await User.create({
        firstname,
        lastname,
        email,
        // contactnumber,
        password:hashedpassword,
        accounttype,
        
        additionalDetails:profiledetails._id,
        // this api is used to generate image automatically
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname}-${lastname}`,
    })
    
    // return response

    return res.status(200).json({
        success:true,
        message:"user is regsitered succesfully",
        user
    });

    } catch(error){

        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message,
            message:"user cannot be regsitered please try again"
            
        })
    }
    

}


//login

async function login(req, res){
    try{

        // get email and pssword from req.body
        const {email, password}=req.body;
        // validate data whether all field are filled or not
        if(!email||!password){
            return res.status(403).json({
                success:false,
                message:"all fields are required"
            });
        }

        // check user exist or not

        const user=await User.findOne({email:email}).populate("additionalDetails").exec();
        if(!user){
            return res.status(401).json({
                success:false,
                message:"user is not regsitered please signup first"
            });
        }

        console.log("registered user is =>" , user);

        // generate jwt token after password matching 

        if(await bcrypt.compare(password,user.password)){
            // creating token
            const payload={
               email: user.email,
               id:user._id,
               role:user.accounttype
            }
            
            const token=jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"10h",
            });

            user.token=token;
            user.password=undefined;

            // creat cookie and send res
            const options={
                // expires in 3 days
                expiresIn: new Date(Date.now() + 3*24*60*60*100),
                httpOnly:true
            }

            res.cookie("token" , token , options).status(200).json({
                success:true,
                token,
                user,
                message:"logged in succesfully"
            });
            
        } else {
            return res.status(401).json({
                success:false,
                message:"password is incorrect"
            })
        }

    } catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message,
            message:"login failure please try again"
        })
    }
}


// change password


async function changepassword(req,res){
    try{
        // get data 
        // get old password , new password , confirm new password
        const{ oldpassword , newpassword , confirmnewpassword}=req.body;

        const userid=req.user.id;

        // validation does we get all data or not 
        if(!oldpassword || !newpassword || !confirmnewpassword ){
            return res.status(403).json({
                success:false,
                message:"all fields are required"
            });
        }
    

        // check new password and confirm new password are matching
        if(newpassword !== confirmnewpassword) {
            return res.status(400).json({
                success:false,
                message:"password and confirm password do not match"
            });
        }

        // fecth user and get password
        const user=await User.findById(userid).populate("additionalDetails").exec();

        // check old password is matching or not 
        if(await bcrypt.compare(oldpassword , user.password)){
            // old password matched
            // hash new password
            const hashedpassword=await bcrypt.hash(newpassword , 10);
            // update user
            const updateduser=await User.findByIdAndUpdate({_id:userid} , {password:hashedpassword} , {new:true}).populate("additionalDetails").exec();
            // return response password chnged
            return res.status(200).json({
                success:true,
                message:"password changed succesfully",
                olduser:user,
                updateduser:updateduser,
            })
        } else {
            return res.status(404).json({
                success:false,
                message:"old password doesnt match"
            });
        }
 
        
    } catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message,
            message:"failed to change password try again"
        })
    }
}

module.exports={login ,  changepassword , sendotp , signup}  