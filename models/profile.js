const mongoose=require("mongoose");

const additionaldetailsschema=new mongoose.Schema(
    {
        gender:{
            type:String,
            // required:true,
            // trim:true
        },

        dateofbirth:{
            type:String,
            // required:true,
            // trim:true
        },

        About:{
            type:String,
            
        },

        number:{
            type:Number,
            // required:true,
            trim:true,
           
        }
        

    }
);

module.exports=mongoose.model("profilemodel" , additionaldetailsschema);