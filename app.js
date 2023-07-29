const express=require("express");
const morgan=require("morgan");
const createError=require("http-errors");
require('dotenv').config();
require('./helpers/init_mongodb')

const {verifyAccessToken}=require('./helpers/jwt_helper');

const AuthRoute=require('./routes/Authroute');
const app=express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.get('/',verifyAccessToken,async(req,res,next)=>{
    res.send("hello from express servere")
    
})

app.use('/auth',AuthRoute)

app.use(async(req,res,next)=>{
    //const error=new Error("not found");
   // error.status=404
    //next(error)
    next(createError.NotFound('tHIS rOUTE IS NOT FOUND'));
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500)
    res.send({
        error:{
            status:err.status||500,
            message:err.message

        }
    })
})

const PORT=process.env.PORT||3000;


app.listen(PORT,()=>{
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
})
