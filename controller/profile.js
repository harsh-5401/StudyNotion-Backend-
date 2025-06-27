const profilemodel=require("../models/profile");
const User=require("../models/user")
// const cloduinary=require("../config/cloudinary")
const uploadimagetocloudinary=require("../utillities/imageuploder");
require("dotenv").config();
// const cloudinary=require("cloudinary").v2
// const { convertSecondsToDuration } = require("../../src/utils/secToDurationFrontend");
// const courseProgressmodel= require("../models/courseprogress")
const coursemodel= require("../models/course");
// const course = require("../models/course");


async function updateprofile(req,res){
    try{
        // get data
        const{dateofbirth="" , about="" , number , gender , firstname , lastname}=req.body;

        // console.log("firstname=" , firstname , "lastname=" , lastname);

        /// get user id
        // we have attached it inside request when we authenticate user
        // user id is send here by frondend as user is already logged in
        // then only he can update profile
        const userid=req.user.id;

        // validation
        if(!number || !gender ||!userid || !firstname || !lastname){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            });
        }
        // find profile using user id
        const userdetails=await User.findById(userid);
        // console.log("userDetails=...." , userdetails)
        const profileid=userdetails.additionalDetails._id;
        // console.log("profileis=" , profileid)
        const profiledetails=await profilemodel.findById(profileid);
        // console.log("profiledetails=" , profiledetails)

        // update profile
        // here we are using save function for fun
        profiledetails.dateofbirth=dateofbirth;
        profiledetails.About=about;
        profiledetails.gender=gender;
        profiledetails.number=number;

        await profiledetails.save();

        // update user
        userdetails.firstname=firstname;
        userdetails.lastname=lastname;
        userdetails.save()

        // send updated user
        const updateduser=await User.findById(userid).populate("additionalDetails").exec()
                                                    

        // return response
        return res.status(200).json({
            success:true,
            message:"profile updated succesfully",
            profiledetails,
            userdetails:updateduser
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"unable to update profile"
        })
    }

}


// get details of specific user
async function alluserdetails(req,res){
    try{
        
        // get userid
        const userid=req.user.id;

        // validate
        const userdetails=await User.findById(userid).populate("additionalDetails").exec();
        // console.log("userdetails are = " , userdetails);
        if(!userdetails){
            return res.status(400).json({
                success:false,
                message:"user doesnt exist"
            });
        }
        
        // return response
        return res.status(200).json({
            success:true,
            message:"user details found succesfully",
            user:userdetails
            
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"unable to fetch user details"
        })
    }

}


async function updateprofilepicture(req,res){
    try{
        // get data
        const profilepicture=req.files.displayPicture;
        // console.log("profie picture is =====" , profilepicture)
        
        /// get user id
        const userid=req.user.id;
        // validation
        if(!profilepicture){
            return res.status(403).json({
                success:false,
                message:"Profile picture not found"
            });
        }
        // update picture to cloduinary
        const uploadetails=await uploadimagetocloudinary(profilepicture, process.env.FOLDER_NAME);
        // console.log("cloduinary response =" , uploadetails);
        const imageurl=uploadetails.secure_url;

        // update user inside db
        const updateduser=await User.findByIdAndUpdate({_id:userid} , {image : imageurl} , {new:true}).populate("additionalDetails").exec();

        // return response
        return res.status(200).json({
            success:true,
            message:"profile picture updated succesfully",
            updateduser
        })
    } catch (error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"unable to update profile picture please try again"
        })
    }
} 

async function getEnrolledCourses(req, res) {
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({
          _id: userId,
        })
        .populate({
          path: "courses",
          populate: {
          path: "coursecontent",
          populate: {
            path: "subsection",
          },
          },
        })
        .exec()
  
        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        // for (var i = 0; i < userDetails.courses.length; i++) {
        //   let totalDurationInSeconds = 0
        //   SubsectionLength = 0
        //   for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        //     totalDurationInSeconds += userDetails.courses[i].courseContent[
        //       j
        //     ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        //     userDetails.courses[i].totalDuration = convertSecondsToDuration(
        //       totalDurationInSeconds
        //     )
        //     SubsectionLength +=
        //       userDetails.courses[i].courseContent[j].subSection.length
        //   }
        //   let courseProgressCount = await courseProgressmodel.findOne({
        //     courseID: userDetails.courses[i]._id,
        //     userId: userId,
        //   })
        //   courseProgressCount = courseProgressCount?.completedVideos.length
        //   if (SubsectionLength === 0) {
        //     userDetails.courses[i].progressPercentage = 100
        //   } else {
        //     // To make it up to 2 decimal point
        //     const multiplier = Math.pow(10, 2)
        //     userDetails.courses[i].progressPercentage =
        //       Math.round(
        //         (courseProgressCount / SubsectionLength) * 100 * multiplier
        //       ) / multiplier
        //   }
        // }
  
        if (!userDetails) {
          return res.status(400).json({
            success: false,
            message: `Could not find user with id: ${userDetails}`,
          })
        }
        return res.status(200).json({
          success: true,
          data: userDetails.courses,
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
          message:"error in getting enrolled courses"
        }) 
      }
}


async function InstructorDashboard(req, res) {
    try {
        const userid= req.user.id;
        const coursedetails= coursemodel.find({instructor : userid});
        // console.log("COURSES OF USER=" , coursedetails);

        const coursedata= (await coursedetails).map((course)=> {
            const totalstudentEnrolled= course.studentsenrolled.length;
            const totalamountGenerated= totalstudentEnrolled * course.price;

            // creat new object with additional Details
            const courseDatawithStats= {
                coursename:course.coursename,
                _id:course._id,
                totalamountGenerated,
                totalstudentEnrolled,
                coursedescription:course.coursedescription
            }

            return courseDatawithStats
        })

        res.status(200).json({
            courses:coursedata
        })


    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Internal service error"
        })
    }
}

 
module.exports={updateprofile, alluserdetails , updateprofilepicture , getEnrolledCourses , InstructorDashboard} ;
 