

const mongoose=require("mongoose");

const categoryschema=new mongoose.Schema(
    {
        // we need array of multiple courses 
        courses:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"coursemodel",
        }],

        name:{
            type:String,
            required:true,

        },
        
        description:{
            type:String,
            required:true,
        }


    }
);

module.exports=mongoose.model("categorymodel" , categoryschema);