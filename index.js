const express=require("express");
const app=express();

// import routes
const userroutes=require("./routes/user");
const profileroutes=require("./routes/profile");
const paymentroutes=require("./routes/payments");
const courseroutes=require("./routes/course");
const contactroutes= require("./routes/contact");

const dbconnect=require("./config/database");
const cookieparser=require("cookie-parser");

// we want our backend to entertain the requests of frontend
// thats why we use cors
const cors=require("cors");
// const cloudinaryconnect=require("./config/cloudinary")
const dotenv=require("dotenv");
const fileupload = require("express-fileupload");
const cloudinaryconnect = require("./config/cloudinary");
const { authentication, isadmin } = require("./middleware/authentication");

dotenv.config();
const PORT=process.env.PORT  || 4000;

// databse connect
dbconnect();


// cloudinary connection
cloudinaryconnect();


//middlewwares

app.use(express.json());
app.use(cookieparser());
app.use(
    cors({
        origin:"http://localhost:3000",

    })
);

app.use(
    fileupload({
        useTempFiles:true,
        tempFileDir:"/tmp/",
    })
);

// routes

app.use("/api/v1/auth" , userroutes);
app.use("/api/v1/profile" , profileroutes);
app.use("/api/v1/course" , courseroutes);     
app.use("/api/v1/payment" , paymentroutes);
app.use("/api/v1/" , contactroutes);



// deafult route
app.get("/" , (req, res)=>{
    return res.json({
        success:true,
        message:"your server is up and running"
    })
});

// listen server

app.listen(PORT , ()=>{
    console.log(`app is runnung at port ${PORT}`);
});