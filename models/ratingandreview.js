

const mongoose=require("mongoose");

const ratingandreviewschema=new mongoose.Schema(
    {

        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },

        rating:{
            type:Number,
            required:true,

        },
        
        review:{
            type:String,
            required:true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "coursemodel",
            index: true,
        },


    }
);

module.exports=mongoose.model("ratingandreviewmodel" , ratingandreviewschema);