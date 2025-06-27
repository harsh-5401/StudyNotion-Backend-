const subsectionmodel = require("../models/subsection");
const courseprogressmodel= require("../models/courseprogress")

async function updateCourseProgress(req, res) {
    const {courseid , subsectionid} = req.body;
    const userid= req.user.id;

    // console.log(" INSIDE UPDATE COURSE PROGRESS = " , courseid , " " , subsectionid ," "  , userid);

    try{
        // check if subsection valid
        const subsection= subsectionmodel.findById(subsectionid);
        if(!subsection){
            return res.status(404).json({
                success:false,
                message:"subsection doesnt exist"
            })
        }

        // check for old entry in course progress
        let courseprogress= await courseprogressmodel.findOne({
            userid:userid,
            courseid:courseid

        });

        // console.log("courprogress model is " , courseprogress)

        if(!courseprogress) {
            return res.status(404).json({
                success:false,
                message:"courseprogress doesnt exist"
            })
        }

        // check for recompleting Video/subsection

        if(courseprogress.completedvideos.includes(subsectionid)){
            return res.status(400).json({
                // success:false,
                message:"subsection already completed"
            })
        }

        // if course progress exist push subsectionid into courseprogress array

        courseprogress.completedvideos.push(subsectionid);

        await courseprogress.save();

        return res.status(200).json({
            success:true,
            message:"lecture succesfully marked completed"
        })


    } catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"internal server error"
        })
    }

}


// async function updateCourseProgress(req, res) {
//     const {courseid , subsectionid} = req.body;
//     const userid= req.user.id;

//     console.log(" INSIDE UPDATE COURSE PROGRESS = " , courseid , " " , subsectionid ," "  , userid);

//     try {
//         const subSection = await subsectionmodel.findById(subsectionid);

//         if(!subSection){
//             return res.status(404).json({
//                 error:"Invalid SubSection"
//             })
//         }

//         let courseProgress = await courseprogressmodel.findOne({
//             courseid:courseid,
//             userid:userid
//         })

//         console.log("course progress is" , courseProgress)

//         if (!courseProgress) {
//             return res.status(404).json({
//                 error:"Course Progress does not exist"
//             })
//         }
//         else{
//             if (courseProgress.completedVideos.includes(subsectionid)) {
//                 return res.status(200).json({
//                     success:false,
//                     message:"Video already completed"
//                 })
//             }

//             courseProgress.completedVideos.push(subsectionid);
//             console.log("Course Progress Push Done");
//         }
//         await courseProgress.save();
//         console.log("Course Progress Save call Done");
//         return res.status(200).json({
//             success:true,
//             message:"Course Progress Updated Successfully",
//         })

//     } catch (error) {
//         console.error(error);
//         return res.status(400).json({error:"Internal Server Error"});
//     }

// }


async function  getProgressPercentage (req, res){
    const { courseid } = req.body
    const userId = req.user.id

  if (!courseid) {
    return res.status(400).json({ error: "Course ID not provided." })
  }

  try {
    // Find the course progress document for the user and course
    let courseProgress = await courseprogressmodel.findOne({
      courseid: courseid,
      userid: userId,
    })
      .populate({
        path: "courseiD",
        populate: {
          path: "coursecontent",
        },
      })
      .exec()

    if (!courseProgress) {
      return res
        .status(400)
        .json({ error: "Can not find Course Progress with these IDs." })
    }
    // console.log(courseProgress, userId)
    let lectures = 0
    courseProgress.courseid.coursecontent?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })

    let progressPercentage =
      (courseProgress.completedvideos.length / lectures) * 100

    // To make it up to 2 decimal point
    const multiplier = Math.pow(10, 2)
    progressPercentage =
      Math.round(progressPercentage * multiplier) / multiplier

    return res.status(200).json({
      data: progressPercentage,
      message: "Succesfully fetched Course progress",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}


// exports.getProgressPercentage = async (req, res) => {
//   const { courseId } = req.body
//   const userId = req.user.id

//   if (!courseId) {
//     return res.status(400).json({ error: "Course ID not provided." })
//   }

//   try {
//     // Find the course progress document for the user and course
//     let courseProgress = await CourseProgress.findOne({
//       courseID: courseId,
//       userId: userId,
//     })
//       .populate({
//         path: "courseID",
//         populate: {
//           path: "courseContent",
//         },
//       })
//       .exec()

//     if (!courseProgress) {
//       return res
//         .status(400)
//         .json({ error: "Can not find Course Progress with these IDs." })
//     }
//     console.log(courseProgress, userId)
//     let lectures = 0
//     courseProgress.courseID.courseContent?.forEach((sec) => {
//       lectures += sec.subSection.length || 0
//     })

//     let progressPercentage =
//       (courseProgress.completedVideos.length / lectures) * 100

//     // To make it up to 2 decimal point
//     const multiplier = Math.pow(10, 2)
//     progressPercentage =
//       Math.round(progressPercentage * multiplier) / multiplier

//     return res.status(200).json({
//       data: progressPercentage,
//       message: "Succesfully fetched Course progress",
//     })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({ error: "Internal server error" })
//   }
// }


module.exports={updateCourseProgress , getProgressPercentage};