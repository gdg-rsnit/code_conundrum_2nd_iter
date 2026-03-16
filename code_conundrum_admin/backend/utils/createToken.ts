import jwt from "jsonwebtoken"
import type { Response } from "express";
const createToken=(res:Response,userId:string):string=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET! as string,{expiresIn:"3h"});
    console.log(token)

    res.cookie('jwt',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV!=='development',
        sameSite:"strict",
        maxAge:3*60*60*1000,
    });
    return token;
}

export default createToken;