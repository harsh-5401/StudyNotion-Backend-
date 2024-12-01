const express = require("express")
const router = express.Router()
// const { auth, isInstructor } = require("../middleware/auth")
const{authentication, isinstructor}=require("../middleware/authentication");
const {getEnrolledCourses, InstructorDashboard} = require("../controller/profile")

const {

updateprofile,
alluserdetails,
updateprofilepicture
} = require("../controller/profile");

const accountdelete=require("../controller/deleteaccount")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", authentication ,accountdelete)
router.put("/updateprofile", authentication, updateprofile)
router.get("/getUserDetails", authentication, alluserdetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", authentication, getEnrolledCourses)
router.put("/updateDisplayPicture", authentication, updateprofilepicture)
router.get("/instructorDashboard", authentication, isinstructor, InstructorDashboard)

module.exports = router
 