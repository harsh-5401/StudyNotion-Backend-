const mongoose=require("mongoose");

const courseprogressschema=new mongoose.Schema(
    {
        courseid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"coursemodel"
        },

        completedvideos:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"subsectionmodel"
            }
        ],

        userid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
        

    }
);

module.exports=mongoose.model("courseprogressmodel" , courseprogressschema);