const express=require('express');
const router=express.Router();
const createError=require('http-errors');
const User=require('../Models/user');

const {authSchema}=require('../helpers/validation_schema');
const {signAccessToken,signRefreshToken, verifyRefreshToken}=require('../helpers/jwt_helper');


router.post('/register',async(req,res,next)=>{
    
    try{
        //const {email,password}=req.body
        //if(!email || !password) throw createError.BadRequest()

        const result=await authSchema.validateAsync(req.body);


        const doesExists=await User.findOne({email:result.email})
        if (doesExists) 
        throw createError.Conflict(`${result.email} is already being registered`)

        const user=new User({result})
        const savedUser=await user.save()
        const accessToken=await signAccessToken(savedUser.id)
        const refreshToken=await signRefreshToken(savedUser.id)

        res.send({accessToken});
    }catch(error){
        if(error.isJoi===true) error.status=422
            next(error)
        }
      
    }
)

router.post('/login',async(req,res,next)=>{
    try{
        const result=await authSchema.validateAsync(req.body);
        const user=await User.findOne({email:result.email})
        if(!user) throw createError.NotFound("User Not Registered")

        const isMatch=await user.isValidPassword(result.password)
        if(!isMatch) throw createError.Unauthorized('username/password is not matched')
        const accessToken=await signAccessToken(user.id)
        const refreshToken=await signRefreshToken(user.id)
        res.send({accessToken,refreshToken})

    }catch(error){
        if(error.isJoi===true)
        return next(createError.BadRequest("Invalid Username/Password"))
    }
})

router.post('/refresh-token',async(req,res,next)=>{
    try{
        const {refreshToken}=req.body
        if(!refreshToken) throw createError.BadRequest()
        const userId=await verifyRefreshToken(refreshToken)
        const accessToken=await signAccessToken(userId)
        const refreshToken=await signRefreshToken(userId)
        res.send({accessToken,refreshToken})

    }catch(error){
        throw error
    }
})

router.delete('/logout',async(req,res,next)=>{
    try{

        const {refreshToken}=req.body
        if(!refreshToken) throw createError.BadRequest()
        //now delete both access tokens and refresh tokens to logout user

    }catch(error){
        next(error)
    }
})




module.exports=router