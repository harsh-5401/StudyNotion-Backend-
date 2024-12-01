const express = require("express")
const router = express.Router()

const {contactform} = require("../controller/contact")

router.post("/reach/contact", contactform)

module.exports = router
