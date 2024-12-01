// Import the required modules
const express = require("express")
const router = express.Router()


const{capturepayment , verifypayment , sendPaymentSuccessEmail}=require("../controller/payments")
const { authentication, isinstructor, isstudent, isadmin } = require("../middleware/authentication")

router.post("/capturePayment", authentication, isstudent, capturepayment)
router.post("/verifyPayment", authentication, isstudent, verifypayment)  

router.post("/sendPaymentSuccessEmail", authentication, isstudent, sendPaymentSuccessEmail);

// router.post("/verifySignature", verifypayment)

module.exports = router
