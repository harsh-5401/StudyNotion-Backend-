
const express = require("express")
const router = express.Router()



// Course Controllers Import

const{creatcourse , getallcourse , coursedetails , editcourse , getInstructorCourses , deleteCourse , getFullCourseDetails  } = require("../controller/course");


// Tags Controllers Import

// Categories Controllers Import

const {categorypageDetails , showallcategory , createcategory}=require("../controller//category");


// Sections Controllers Import
const {
  createsection,
  updatesection,
  deletesection,
} = require("../controller/section")

// Sub-Sections Controllers Import

const{createsubsection , updatesubsection , deletesubsection} = require("../controller/subsection")

// Rating Controllers Import
const {
    createratingandreview,
    getAverageRating,
    getallratingandReview,
} = require("../controller/ratingandreview")

// course progress controllers

const {
  updateCourseProgress,
  getProgressPercentage,
} = require("../controller/courseprogress")

// Importing Middlewares
const { authentication, isinstructor, isstudent, isadmin } = require("../middleware/authentication")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", authentication, isinstructor, creatcourse)
// Edit Course routes
router.post("/editCourse", authentication, isinstructor, editcourse)
//Add a Section to a Course
router.post("/addSection", authentication, isinstructor, createsection)
// Update a Section
router.post("/updateSection", authentication, isinstructor, updatesection)
// Delete a Section
router.post("/deleteSection", authentication, isinstructor, deletesection)
// Edit Sub Section
router.post("/updateSubSection", authentication, isinstructor, updatesubsection)
// Delete Sub Section
router.post("/deleteSubSection", authentication, isinstructor, deletesubsection)
// Add a Sub Section to a Section
router.post("/addSubSection", authentication, isinstructor, createsubsection)

// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", authentication, isinstructor, getInstructorCourses)

// Get all Registered Courses
router.get("/getAllCourses", getallcourse)

// Get Details for a Specific Courses
router.post("/getCourseDetails", coursedetails)

// Get Details for a Specific Courses
router.post("/getFullCourseDetails", authentication, getFullCourseDetails)

// To Update Course Progress
router.post("/updateCourseProgress", authentication, isstudent, updateCourseProgress)

// To get Course Progress
router.post("/getProgressPercentage", authentication, isstudent, getProgressPercentage)

// Delete a Course
router.delete("/deleteCourse",authentication, isinstructor, deleteCourse)

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here

router.post("/createCategory", authentication, isadmin, createcategory)  // checked
router.get("/showAllCategories", showallcategory)         // checked   
router.post("/getCategoryPageDetails",categorypageDetails)              // checked

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", authentication, isstudent, createratingandreview)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getallratingandReview)


module.exports = router
