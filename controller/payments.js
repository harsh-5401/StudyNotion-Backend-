const {instance}=require("../config/razorpay");
const mongoose=require("mongoose");
const coursemodel=require("../models/course");
// const mailsender=require("../utillities/mailsender");
const mailsender= require("../utillities/mailsender")
const User=require("../models/user");
const {courseEnrollmentEmail}=require("../mail/template/courseEnrollmentEmail");
const { current } = require("@reduxjs/toolkit");
const course = require("../models/course");
const {paymentSuccessEmail} = require("../mail/template/paymentSuccessEmail");
const { response } = require("express");
require("dotenv").config();
const crypto= require("crypto");
const courseprogressmodel= require("../models/courseprogress")



// for single course

// capturr payment and initiate razorpay order

// async function capturepayment(req,res){
   

//    /// get course id and user id
//    const {courseid}=req.body;
//    const {userid}=req.user.id;

//    // validation

//    // valid course id,
//    if(!courseid){
//        return res.json({
//        success:false,
//        message:"please provide valid course id"
//        });
//    }

//    // valid course detail
//    let course;
//    try{
       
//        course=await coursemodel.findById(courseid);
//        if(!course){
//            return res.json({
//                success:false,
//                 message:"could not find the course"
//                });
//            }

//        /// user already paid for course or not

//        ///// here we have our userid as string but in our course model
//        // it exist as object so here we need to convert string to object
//        const uid=new mongoose.Types.ObjectId(userid);
       
//        if(course.studentsenrolled.includes(uid)){
//            return res.status(200).json({
//                    success:false,
//                    message:"student is already enrolled in course"
//            });
//        }

//    } catch(error) {

//        console.log(error);
//        return res.status(500).json({
//            success:false,
//            message:error.message
//        });
//    }
           
//        // order create
//        const amount=course.price;
//        const currency="INR";

//        const options={
//            amount:amount*100,
//            currency,
//            receipt : Math.random(Date.now()).toString(),
//            notes:{
//                courseid:courseid,
//                userid
//            }
//        }

//        try{
//            // initaiate the payment using razirpay and return response 
//            const paymentresponse=await instance.orders.create(options);
//            console.log("paymentResponse=" , paymentresponse);
//            return res.status(200).json({
//                success:true,
//                message:"order initiate succesfully",
//                coursename:course.coursename,
//                coursedescription:course.coursedescription,
//                thumbnail: course.thumbnail,
//                orderid:paymentresponse.id,
//                currency:paymentresponse.currency,
//                amount:paymentresponse.amount,
//            })

//        } catch(error){
//            console.log(error);
//            res.json({
//                success:false,
//                message:"could not initiate order"
//            });
//        }
           

// }


// // verify signature of razorpay and server

// async function verifysignature(req , res){
//    // this is our signature we have on our sever and other we get from razorpay
//    const webhooksecret="12345678";

//    // we get this signature from  razorpay in header 
//    const signature = req.header("x-razorpay-signature");

//    const shasum=crypto.createHmac("sha256" , webhooksecret );

//    //conver this hmac object into string
//    shasum.update(JSON.stringify(req.body));

//    const digest=shasum.digest("hex");

//    // match signature and digest
   
//    // we got this request from razorpay as your web hook get activated 
//    // we will not get data here from req.body
//    // we have passed userid and course id from notes we have send in upper function
//    if(signature===digest){
//        console.log("payment is authorised");   

//        const {userid , courseid} = req.body.payload.payment.entity.notes;

//        try{

//            //fulfill the action 

//            // find the course and enroll student in it 
//            const enrolledcourse=await coursemodel.findOneAndUpdate(
//                                                {_id:courseid},
//                                                {$push: {studentsenrolled : userid}},
//                                                {new:true}
//            );

           

//            if(!enrolledcourse){
//                return res.status(500).json({
//                    success:false,
//                    message:"course not found"
//                });
//            }

//            // add course to user schema
//            // find user and add course to list of enrolled courses

//            const enrolledstudent=await User.findByIdAndUpdate(
//                                                {_id:userid},
//                                                {$push:{courses : courseid}},
//                                                {new:true}
//            );

//            console.log("enrolled student = " , enrolledstudent);

//            // student has enrolled now send confirmation mail to student

//            const emailresponse=await mailsender(enrolledstudent.email , "congralutions from study notion" ,  "Congratulation you are onboarded on course " );

//            console.log("email response =" , emailresponse);

//            return res.status(200).json({
//                success:false,
//                message:"signature verified and course added"
//            });

//        } catch (error){
//                console.log(error);
//                return res.status(500).json({
//                    success:false,
//                    message:error.message,
//                    message:"unable to verify signature and add user to course"
//                });
//        }
//    }  

//    else{
//        return res.status(400).json({
//            success:false,
//            message:"invalid request"
//        });
//    }

// }   


// for multiple courses 


async function capturepayment(req, res) {

    

        const {courses} = req.body;
        const {userid}= req.user.id;

        // console.log("inside capture payment");
        // console.log("courses are =" , courses)
        // console.log("userid is =" , userid)

        if(courses.length ===0) {
            return res.json({
                success:false,
                message:"please provide course id"
            })
        }

        let totalamount=0;

        //calculate totalamout and check that user not already enrolled in course

        for(const courseid of courses) {
            let course;

            try{ 
                // console.log("printing course ID=" , courseid)
                course = await coursemodel.findById({_id:courseid})
                // console.log("course after searching " , course)
                if(!course) {
                    return res.status(200).json(
                        {
                            success:false,
                            message:"could not found course"
                        }
                    )
                } 
                // check that user is not already enrolled in that course

                const uid= new mongoose.Types.ObjectId(userid);
                if(course.studentsenrolled.includes(uid)) {
                    return res.status(200).json({
                        success:false,
                        message:"Student is already enrolled"
                    })
                }

                totalamount=totalamount + course.price;
                

            } catch(error) {
                console.log(error);
                return res.status(500).json({
                    success:false,
                    message:error.message
                })
            }

            

        }

        // console.log("total amount is " , totalamount);  

        const options= {
            amount:totalamount*100,
            currency:"INR",
            // receipt:Math.random(Date.now().toString()),
            receipt : Math.random(Date.now()).toString(),
        }

        // creating order 
        try{
            // const paymentresponse= await instance.orders.create(options);
            const paymentresponse=await instance.orders.create(options);
            // console.log("paymentresponse=" , paymentresponse)
            res.status(200).json({
                success:true,
                message:paymentresponse
            })

        } catch(error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:"Could not initiate order"
            })
        }

    
}


// verify payment or verify signature

async function verifypayment(req, res) {

    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses=req.body.courses;
    const userid= req.user.id

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userid) {
        return res.status(200).json({
            success:false,
            message:"payment failed fields are missing"
        })
    }

    // console.log("razorpay orderid" , razorpay_order_id)
    // console.log("razorpay payment" , razorpay_payment_id)
    // console.log("razorpay signa" , razorpay_signature)
    // console.log("razorpay courses" , courses)
    // console.log("razorpay userid" , userid)

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedsignature = crypto.createHmac("sha256" , process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex");
    // console.log("expected signature is " , expectedsignature);

    if(expectedsignature === razorpay_signature) {
        // enroll student in courses

        const enrollstudentResponse=await enrollStudent(courses, userid);

        // return response
        return res.status(200).json({
            success:true,
            message:"Payment verified",
            enrollstudentResponse
        })
    }

    // if signature doesnt match
    return res.status(200).json( {
        success:false,
        message:"payment failed"
    })
}



async function enrollStudent(courses , userid , res) {
    // console.log("INSIDE ENROLL Student");
    // console.log("COURSES ARE" , courses);
    // console.log("user id is" , userid)
    try {

        if(!courses || !userid) {
            return res.status(400).json( {
                success:false,
                message:"Please provide data"
            })
        } 
    
        // find the courses and enroll student in the course and add course in 
        // user schema
    
        for (const courseid of courses) {
            // console.log("courseid inside loop" , courseid);

            const enrolledCourse= await coursemodel.findByIdAndUpdate(
                {_id:courseid},
                {
                    $push:{
                        studentsenrolled:userid
                    }
                },
                {new:true}
            ).populate("studentsenrolled").exec();           

            // console.log("updated course after enrolling user" , enrolledCourse);

            
            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:"Course not found"
                })
            }
    
            // creaat course progress
            const courseprogress= await courseprogressmodel.create({
                courseid:courseid,
                userid:userid,
                completedvideos:[]
            })


            const enrolledStudent=await User.findByIdAndUpdate(
                {_id:userid},
                {
                    $push: {
                        courses:enrolledCourse._id,
                        coursesprogress:courseprogress._id 

                    }
                },
                {new:true}
            ).populate("courses").exec();

            // console.log("user after enrolling in course" , enrolledStudent)
    
            //send mail to Student
            const emailresponse= await mailsender(enrolledStudent.email , `Succesfully enrolled into ${enrolledCourse.coursename}` ,courseEnrollmentEmail(enrolledCourse.coursename , `${enrolledStudent.firstname}`) )
    
            // console.log("email send succesfully " , emailresponse); 
    
        }


    } catch(error) {
        console.log(error);
        return res.status(500).json( {
            success:false,
            message:error.message
        })
    }
}


async function sendPaymentSuccessEmail(req, res) {
    // console.log("payment succesful email req", req );

    const {orderid , paymentid , amount} = req.body;
    const userid= req.user.id;
    
    //  console.log(orderid , " " , paymentid , " " , amount , " " , userid)

    if(!orderid || !paymentid || !amount || !userid) {
        return res.status(400).json({
            success:false, 
            message:"Please provide all fields"
        })
    }


    try {
        // console.log("INDISE TRY BLOCK");
        // find student
        const enrolledStudent= await User.findById(userid);
        // console.log("enrolled student is " , enrolledStudent);
        const mailsenderResponse= await mailsender(enrolledStudent.email , `payment Received` , paymentSuccessEmail(`${enrolledStudent.firstname}` , amount/100 , orderid , paymentid) )
        // console.log("mailsender response current " , mailsenderResponse)
        return res.status(200).json({
            success:true,
            message:"mail send succesful",
            response:mailsenderResponse
        })

    } catch(error) { 
        // console.log("error in sending email");
        return res.status(500).json({
            success:false,
            message:"could not send email"
        })
    }


}

module.exports={capturepayment , verifypayment , sendPaymentSuccessEmail};