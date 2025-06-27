const coursemodel=require("../models/course");
const User=require("../models/user");
const categorymodel=require("../models/category")
const uploadimagetocloudinary=require("../utillities/imageuploder");
const sectionmodel = require("../models/section")
const subsectionmodel= require("../models/subsection");
const {convertSecondsToDuration} = require("../utillities/secToDuration")
const courseprogressmodel= require("../models/courseprogress")




// async function creatcourse(req,res){
//     try{
//         // fectch data and file

//         const {coursename , coursedescription , whatwillyoulearn , price , category } =req.body;

//         console.log(coursename , coursedescription , whatwillyoulearn , price , category )

//         // get thumbnail/file
//         const thumbnail=req.files.thumbnailimage;

//         // validation
//         if(!coursename || !coursedescription || !whatwillyoulearn || !price || !category || !thumbnail) {
//             return res.status(400).json({
//                 success:false,
//                 message:"all fields are required"
//             });
//         }

       

//         // check for insructor and fetch instructor id to put it inside course
//         // asumme we dont have role inside payload
//         const userid=req.user.id;
//         const instructordetails=await User.findById(userid);
//         console.log("instructor details=>" , instructordetails);

//         // if no instrctror find
//         if(!instructordetails){
//             return res.status(404).json({
//                 success:false,
//                 message:"instructor details not found"
//             });
//         }

//         // check if category is valid or not 
//         // note : => here our category is a  id
//         const categorydetails=await categorymodel.findById(category);
//         if(!categorydetails){
//             return res.status(404).json({
//                 success:false,
//                 message:"category details not found"
//             });
//         }

//         // upload image to cloudinary

//         const thumbnailimage=await uploadimagetocloudinary(thumbnail , process.env.FOLDER_NAME);

//         // creat entry of new course 

//         const newcourse=await coursemodel.create({
//             coursename, 
//             coursedescription,
//             instructor:instructordetails._id,
//             price,
//             whatwillyoulearn:whatwillyoulearn,
//             category:categorydetails._id,
//             thumbnail:thumbnailimage.secure_url

//         });

//         // update user which is intrcutor here he dont need to buy this course
//         // add new course to userschema of instrucot

//         await User.findByIdAndUpdate(
//             {_id:instructordetails._id},
//             {
//                 $push:{
//                     courses:newcourse._id
//                 }
//             },
//             {new:true}
//         );

//         // update category schema homework TODO:

//         await categorymodel.findByIdAndUpdate(category,
//             {
//                 $push: {
//                     course: newcourse._id
//                 }
//             })
            
//         // return response

//         return res.status(200).json({
//             success:true,
//             message:"course created succesfully",
//             data:newcourse
//         })

//     } catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//             message:"unable to creat new course"
           
//         });
//     }
// }



async function creatcourse(req,res){

    // testing code 

    try{
        // fectch data and file

        // console.log("data to create course is " , req.body)

        const {coursename , coursedescription , whatwillyoulearn , price , category , status , instructions , tags } =req.body;

        // console.log(coursename , coursedescription , whatwillyoulearn , price , category , status , instructions )
        // console.log("status is " , status)
        // console.log("instruction is " , instructions)

        // get thumbnail/file
        // const thumbnail=req.files.thumbnailimage;

        // validation
        if(!coursename || !coursedescription || !whatwillyoulearn || !price || !category || !instructions  || !status || !tags) {
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            });
        }

       

        // check for insructor and fetch instructor id to put it inside course
        // asumme we dont have role inside payload
        const userid=req.user.id;
        const instructordetails=await User.findById(userid);
        // console.log("instructor details=>" , instructordetails);

        // if no instrctror find
        if(!instructordetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            });
        }

        // check if category is valid or not 
        // note : => here our category is a  id
        const categorydetails=await categorymodel.findById(category);
        

        // console.log("category details is " , categorydetails)

        if(!categorydetails){
            return res.status(404).json({
                success:false,
                message:"category details not found"
            });
        }

        // upload image to cloudinary

        // const thumbnailimage=await uploadimagetocloudinary(thumbnail , process.env.FOLDER_NAME);

        // creat entry of new course 

        const newcourse=await coursemodel.create({
            coursename, 
            coursedescription,
            instructor:instructordetails._id,
            price,
            whatwillyoulearn:whatwillyoulearn,
            category:categorydetails._id,
            status,
            instructions,
            tag:tags

            // thumbnail:thumbnailimage.secure_url

        });

        // update user which is intrcutor here he dont need to buy this course
        // add new course to userschema of instrucot

        await User.findByIdAndUpdate(
            {_id:instructordetails._id},
            {
                $push:{
                    courses:newcourse._id
                }
            },
            {new:true}
        );

        // update category schema homework TODO:

        const includedcatgrory=await categorymodel.findByIdAndUpdate({_id:category},
            {
                $push: {
                    courses: newcourse._id
                }
            },
            {new:true}
        )

        // console.log("included category is " , includedcatgrory)


        // return response

        return res.status(200).json({
            success:true,
            message:"course created succesfully",
            data:newcourse
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            message:"unable to creat new course"
           
        });
    }
}



// get all courses from the the db

async function getallcourse(req,res){
    try{
       
        // const allcourses=await coursemodel.find({} , {coursename:true , price:true , thumbnail:true , instructor:true , ratingAndreviews:true , studentsenrolled :true}).populate("instructor").exec();
        const allcourses=await coursemodel.find({});

        return res.status(200).json({
            success:true,
            // message:error.message,
            allcourses:allcourses,
            message:"all courses fetched succesfully"
           
        });


    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            message:"unable to fetch all courses"
        });
    }
}



// fetch course details with popultaed using id for specific course

async function coursedetails(req, res){
    try{
        // get corse id from req.body
        const {courseid}=req.body;

        if(!courseid){
            return res.status(400).json({
                success:false,
                message:"please provide valid course id"
            })
        }
        // validation
        const coursedetails=await coursemodel.findById(courseid)
                                                    .populate(
                                                        {
                                                            path:"instructor",
                                                            populate:{
                                                                path:"additionalDetails"
                                                            }
                                                        }
                                                    )
                                                    .populate("category")
                                                    // .populate("ratingAndreviews")
                                                    .populate({
                                                        path:"coursecontent",
                                                        populate:{
                                                            path:"subsection"
                                                        }
                                                    })
                                                    .exec();

                            if(!coursedetails){
                                return res.status(400).json({
                                    success:false,
                                    message:`could not find course with  course id no ${courseid}`
                                });
                            }

                            let totalDurationInSeconds = 0
                            coursedetails.coursecontent.forEach((content) => {
                              content.subsection.forEach((subsection) => {
                                const timeDurationInSeconds = parseInt(subsection.timeduration)
                                totalDurationInSeconds += timeDurationInSeconds
                              })
                            })
                        
                            const totalDuration = convertSecondsToDuration(totalDurationInSeconds)  
                // return response

                            return res.status(200).json({
                                success:true,
                                message:"course details fetched succesfully",
                                coursedata:coursedetails,
                                totalduration:totalDuration
                                
                            });
                            


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            message:"failed to fetch course deatils"
        });
    }
}

//edit course

async function editcourse(req,res) {
    try {
        const { courseid } = req.body
        // console.log("course id in edit course is " , courseid);
        const updates = req.body
        // console.log("updates in edit course is " , updates);

        const course = await coursemodel.findById(courseid)
    
        if (!course) {
          return res.status(404).json({ error: "Course not found" })
        }
    
        // If Thumbnail Image is found, update it
        if (req.files) {
          // console.log("thumbnail update")
          const thumbnail = req.files.thumbnailImage
          const thumbnailImage = await uploadimagetocloudinary(
            thumbnail,
            process.env.FOLDER_NAME
          )
          course.thumbnail = thumbnailImage.secure_url
        }
    
        // Update only the fields that are present in the request body
        for (const key in updates) {
          if (updates.hasOwnProperty(key)) {
            // course[key] = updates[key]
            // if (key === "tag" || key === "instructions") {
            //   course[key] = JSON.parse(updates[key])
            // } else {
            //   course[key] = updates[key]
            // }

          if (key === "tags") {
            course.tag = JSON.parse(updates[key]);
          } else if (key === "courseid") {
            course._id = updates[key]; // Map 'courseid' to 'course._id'
          } else {
            course[key] = updates[key];
          }
          }

          // if (key === "tags") {
          //   course[key] = JSON.parse(updates[key]);
          // } else if (key === "courseid") {
          //   course._id = updates[key]; // Map 'courseid' to 'course._id'
          // } else {
          //   course[key] = updates[key];
          // }

        }
    
        await course.save()
    
        const updatedCourse = await coursemodel.findOne({
          _id: courseid,
        }).populate({
            path: "instructor",
            populate: {
              path: "additionalDetails", 
            },
          })
          .populate("category")
        //   .populate("ratingAndReviews")
          .populate({
            path: "coursecontent",
            populate: {
              path: "subsection",
            },
          }).exec()
    
        res.json({
          success: true,
          message: "Course updated successfully",
          data: updatedCourse,
        })
      } catch (error) {
        console.error(error)
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        })
      }
}

// exports.editCourse = async (req, res) => {
//     try {
//       const { courseId } = req.body
//       const updates = req.body
//       const course = await coursemodel.findById(courseId)
  
//       if (!course) {
//         return res.status(404).json({ error: "Course not found" })
//       }
  
//       // If Thumbnail Image is found, update it
//       if (req.files) {
//         console.log("thumbnail update")
//         const thumbnail = req.files.thumbnailImage
//         const thumbnailImage = await uploadimagetocloudinary(
//           thumbnail,
//           process.env.FOLDER_NAME
//         )
//         course.thumbnail = thumbnailImage.secure_url
//       }
  
//       // Update only the fields that are present in the request body
//       for (const key in updates) {
//         if (updates.hasOwnProperty(key)) {
//           course[key] = updates[key]
//           // if (key === "tag" || key === "instructions") {
//           //   course[key] = JSON.parse(updates[key])
//           // } else {
//           //   course[key] = updates[key]
//           // }
//         }
//       }
  
//       await course.save()
  
//       const updatedCourse = await coursemodel.findOne({
//         _id: courseId,
//       })
//         .populate({
//           path: "instructor",
//           populate: {
//             path: "additionalDetails", 
//           },
//         })
//         .populate("category")
//         .populate("ratingAndReviews")
//         .populate({
//           path: "courseContent",
//           populate: {
//             path: "subSection",
//           },
//         })
//         .exec()
  
//       res.json({
//         success: true,
//         message: "Course updated successfully",
//         data: updatedCourse,
//       })
//     } catch (error) {
//       console.error(error)
//       res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       })
//     }
//   }



  async function getInstructorCourses(req, res) {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await coursemodel.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 }).populate({
        path: "coursecontent",
        populate: {
          path: "subsection",
        },
      })
      .exec()
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }


  async function deleteCourse(req, res) {
    try {
      // console.log("delete course req is " , req)
      const { courseid } = req.body;
      // console.log("req ki body is" , req)
      const userid=req.user.id;
      // console.log("user id " , userid)
  
      // Find the course
      const course = await coursemodel.findById(courseid)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }

      // console.log("delete course course is " , course);

      const courseCategoryid=course.category;

      // console.log("courseCategoryid " , courseCategoryid);


      // removing course from category 
      const category= await categorymodel.findByIdAndUpdate(
        {_id : courseCategoryid},
        {
          $pull: {
            courses: courseid,
          },
        },
        {new:true}
      );

      // console.log("category after updation is " , category);
  
      // Unenroll students from the course

      // const studentsEnrolled = course.studentsEnrolled
      // for (const studentId of studentsEnrolled) {
      //   await User.findByIdAndUpdate(studentId, {
      //     $pull: { courses: courseId },
      //   })
      // }
  
      // Delete sections and sub-sections
      const courseSections = course.coursecontent
      for (const sectionid of courseSections) {
        // Delete sub-sections of the section 
        const section = await sectionmodel.findById(sectionid) 
        if (section) {
          const subSections = section.subsection
          for (const subsectionid of subSections) {
            await subsectionmodel.findByIdAndDelete(subsectionid)
          }
        }
  
        // Delete the section
        await sectionmodel.findByIdAndDelete(sectionid)
      }

      // remove courseid from user
      await User.findByIdAndUpdate(userid,
        {
          $pull: { courses: courseid }
        }
        
      )
      

      // Delete the course
      await coursemodel.findByIdAndDelete(courseid)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        deletedcourse:course
      })

    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }

  }

  async function getFullCourseDetails(req, res) {
    // console.log("INside  getFullCourseDetails")
    try {
      const { courseid } = req.body
      // console.log("courseid is " , courseid)
      const userId = req.user.id
      // console.log("userid is " , userId)

      const courseDetails = await coursemodel.findOne({
        _id: courseid,
      }).populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        // .populate("ratingAndReviews")
        .populate({
          path: "coursecontent",
          populate: {
            path: "subsection",
          },
        })
        .exec()

        // const courseDetails = await coursemodel.findById(courseid);
        // const fullcoursedetails=courseDetails.populate({
        //   path: "instructor",
        //   populate: {
        //     path: "additionalDetails",
        //   },
        // })
        // .populate("category")
        // .populate({
        //   path: "coursecontent",
        //   populate: {
        //     path: "subsection",
        //   },
        // })
        // .exec()

        // .populate("ratingAndReviews")
  
      let courseProgressCount = await courseprogressmodel.findOne({
        courseid: courseid,
        userid: userId,
      })
  
      // console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseid}`,
        })
      }

    //   unwanted 
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }

      //   unwanted 
  
    //   let totalDurationInSeconds = 0
    //   courseDetails.courseContent.forEach((content) => {
    //     content.subSection.forEach((subSection) => {
    //       const timeDurationInSeconds = parseInt(subSection.timeDuration)
    //       totalDurationInSeconds += timeDurationInSeconds
    //     })
    //   })
  
    //   const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          // totalDuration,
          completedVideos: courseProgressCount?.completedvideos
            ? courseProgressCount?.completedvideos
            : [],
            
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }


  // pending :course progress conroller

// async function handleLectureCompletion(req, res) {

// }



module.exports={getallcourse , creatcourse , coursedetails , editcourse , getInstructorCourses , deleteCourse , getFullCourseDetails }