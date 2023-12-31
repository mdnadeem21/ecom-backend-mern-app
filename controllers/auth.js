const User = require("../models/user")
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken');
const  expressjwt  = require("express-jwt");


exports.signout = (req,res) =>{
    res.clearCookie("token")
    res.json({
        mesage : "User signout successfully",
        statuscode : 200
    });
}

exports.signup = (req,res) =>{
     const errors = validationResult(req)
     if(!errors.isEmpty()){
        return res.status(422).json({
            error : errors.array()[0].msg,
            param : errors.array()[0].param
        })
     }


   const user = new User(req.body)
   user.save((error,user) =>{
        if(error){
            return res.status(400).json({
                error : "Not able to save user in DB"
            })
        }
        return res.json({
            name  : user.name,
            email : user.email,
            id : user._id
        })
   })
}

exports.signin = (req,res) =>{
    const {email,password} = req.body
    const errors = validationResult(req)
     if(!errors.isEmpty()){
        return res.status(422).json({
            error : errors.array()[0].msg,
            param : errors.array()[0].param
        })
     }
    User.findOne({email}, (err,user) =>{
         if(err || !user){
            return res.status(400).json({
                error : "User email does not exist"
            })
         }
         if(!user.authenticate(password)){
              return res.status(401).json({
                error : "Password does not matched"
              })
         }
       // create token
       const token = jwt.sign({_id : user._id},process.env.SECRET)
       // put token in cookie
       res.cookie("token",token,{expire : new Date() + 9999})
       // send response to frontend
       const {_id,name,email,role} = user
       return res.json({token,user : {_id,name,email,role}})

    })

}


//protected routes
exports.isSignedIn = expressjwt({
    secret : process.env.SECRET,
    userProperty : "auth"
})

//custom middlewares
exports.isAuthenticated = (req,res,next) =>{
    let checker = req.profile && req.auth && (req.profile._id ==  req.auth._id);
    if(!checker){
        return res.status(403).json({
            error : "UNAUTHORIZED USER"
        })
    }
    next();
}
exports.isAdmin = (req,res,next) =>{
    if(req.profile.role === 0 ){
        return res.status(403).json({
            error : "You are not an ADMIN, ACCESS DENIED"
        })
    }
    
    next()

}