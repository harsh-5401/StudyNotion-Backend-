       

        const profilemodel=require("../models/profile");
        const User=require("../models/user")
        const mongoose= require("mongoose")
        
        async function accountdelete(req,res){
            try{
               
                // get user id
                const userid=req.user.id;
                console.log("user id isn delte=" , userid)
        
                // validation to check whther id exits or not
                // const objectId = new mongoose.Types.ObjectId(userid);
                const userdetails=await User.findById({_id:userid})
                console.log("user details are=" , userdetails)

                if(!userdetails){
                    return res.status(400).json({
                        success:false,
                        message:"user doesnt exist"
                    });
                }
        
                //delete user profile/additional details\
                await profilemodel.findByIdAndDelete({_id:userdetails.additionalDetails});
        
                
        
                // delete user
        
                await User.findByIdAndDelete({_id:userid});
        
                
        
                // return response
                return res.status(200).json({
                    success:true,
                    message:"user deleted succesfully",
                    
                });
        
            } catch(error){
                console.log(error);
                return res.status(500).json({
                    success:false,
                    error:error.message,
                    message:"unable to delete account"
                });
            }
        
        }
        

module.exports=accountdelete;
        
        