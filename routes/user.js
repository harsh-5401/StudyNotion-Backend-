const express=require("express");
const router=express.Router();

// import controllers 

const{login , signup , sendotp , changepassword} = require("../controller/auth");

const{resetpassword , resetpasswordtoken}=require("../controller/resetpassword");

// import middlewares

const{authentication}=require("../middleware/authentication");


// / Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login);                                      // checked

// Route for user signup
router.post("/signup", signup);                                     // checked

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp);                                // checked

// Route for Changing the password
router.post("/changepassword", authentication , changepassword)     // checked

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetpasswordtoken)    // checked

// Route for resetting user's password after verification
router.post("/reset-password", resetpassword)                // checked

// Export the router for use in the main application
module.exports = router;