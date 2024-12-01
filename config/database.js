const mongoose=require("mongoose");
require("dotenv").config();

function dbconnect(){

     mongoose.connect(process.env.MONGODB_URL , {
        useNewUrlParser : true,
        useUnifiedTopology:true
    })
    .then(()=>console.log(`db connected succesfully`))
    .catch((error)=>{
        console.log("DB connected failed");
        console.log(error);
        process.exit(1);
    })

    
};

module.exports=dbconnect;