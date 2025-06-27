const jwt=require("jsonwebtoken");
// const User=require("../models/user");
require("dotenv").config();

// auth

async function authentication(req,res,next){
    
    try{
        // console.log("inside AUTHENTICATION MIDDLEWARE");
        // extract token
        const token=req.cookies.token|| req.body.token|| req.header("Authorisation").replace("Bearer " ,  "");
        // console.log("PRINTING TOKEN" , token)

        if(!token){
            return res.status(401).json({
                success:false,
                message:"token is missing"
            })
        }

        // verify token
        try{
            const decode=jwt.verify(token, process.env.JWT_SECRET);
            // console.log("decode is " , decode);
            // push payload into req of user
            req.user=decode;
            // console.log(req);

        } catch(error) {

            // verification issues
            console.log(error);
            return res.status(401).json({
                success:false,
                message:"token is invalid",
                token
            })
        }

        next();

    } catch(error){

        console.log(error);
        return res.status(401).json({
            success:false,
            message:"something went wrong while validating token"
        });
    }
}

// is student

async function isstudent(req,res,next){
    try{
        if(req.user.role!=="Student"){
            return res.status(401).json({
                success:false,
                message:"this is route for student are you are not student"
            });           
        }

        next();
        
    } catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified"
        });
        
    }
}


// is instructor 

async function isinstructor(req,res,next){
    try{
        if(req.user.role!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"this is route for instructor and you are not instructor"
            });
        }

        next();

    } catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified"
        });
        
    }
}


// is admin

async function isadmin(req,res,next){
    try{
        if(await req.user.role!=='Admin'){
            return res.status(401).json({
                success:false,
                message:"this is route for admin are you are not admin"
            });

            
        }
        next();
    } catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified"
        });
        
        
    }
}



module.exports={authentication , isadmin , isinstructor , isstudent};