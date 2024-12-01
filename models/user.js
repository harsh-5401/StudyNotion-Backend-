const mongoose=require("mongoose");

const signupmodelschema=new mongoose.Schema(
    {
        firstname:{
            type:String,
            // required:true,
            trim:true
        },

        lastname:{
            type:String,
            // required:true,
            trim:true
        },

        email:{
            type:String,
            required:true,
            trim:true
        },

        password:{
            type:String,
            required:true,
            
        },
        accounttype:{
            type:String,
            enum:["Admin","Student","Instructor"],
            required:true,
        },
        additionalDetails:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:"profilemodel"
        },
        
        courses:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"coursemodel"
            }
        ],
        
        image:{
            type:String,
            // required:true,
        
        },

        // note here it is courses (multiple)
        coursesprogress:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"courseprogressmodel"
            }
        ] ,
        token:{
            type:String,
        },

        resetpasswordexpires:{
            type:Date,
        }

    }
);

module.exports=mongoose.model("User" , signupmodelschema);