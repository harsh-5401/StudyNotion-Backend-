const mongoose=require("mongoose");

const courseschema=new mongoose.Schema(
    {
        coursename:{
            type:String,
            require:true,
        },
        
        coursedescription:{
            type:String,
        },

        instructor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            require:true
        },

        whatwillyoulearn:{
            type:String,
        },

        coursecontent:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"sectionmodel",  
            }
        ],

        ratingAndreviews:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Ratingandreviewmodel",
            }
        ],

        price:{
            type:Number,

        },

        thumbnail:{
            type:String,
        },

        tag:{
            type:[String],
            required:true
        },

        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"categorymodel",
        },

        studentsenrolled:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
            }
        ],

        instructions:{
            type:String,
        },

        status: {
            type: String,
            enum: ["Draft", "Published"],
        },
        
        createdAt: {
            type:Date,
            default:Date.now
        },


    }
);

module.exports=mongoose.model("coursemodel" , courseschema);