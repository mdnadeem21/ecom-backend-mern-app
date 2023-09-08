const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const {signout,signup,signin,isSignedIn} = require("../controllers/auth")

// const signout = (req,res) =>{
//     res.send("Now you are signout")
// } 
// const signout = (req,res) =>{
//     res.json({
//         mesage : "User signout"
//     });
// } 
router.get("/signout",signout)
router.post("/signup",[
    check("name","name should be atleast 3 char")
    .isLength({min : 3}),
    check("email","Email is required")
    .isEmail(),
    check("password","password should be of min 5 char")
    .isLength({min : 5}),
],signup)

router.post("/signin",[
    check("email","Email is required")
    .isEmail(),
    check("password","password is required")
    .isLength({min : 5}),
],signin)

router.get("/testroute",isSignedIn, (req,res) =>{
   res.send("A protected route")
})


module.exports = router