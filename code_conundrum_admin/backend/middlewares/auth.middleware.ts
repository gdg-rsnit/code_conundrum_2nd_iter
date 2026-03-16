import jwt, { type JwtPayload } from "jsonwebtoken";
import {User, type IUser} from "../models/userModel.js"
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request{
    user?:IUser;
}
const authenticate=asyncHandler(async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    let token;
    token=req.cookies?.jwt;

    if (!token){
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    if (token){
        try {
            const decoded=jwt.verify(token,process.env.JWT_SECRET!) as JwtPayload & {userId :string};
            req.user=await User.findById(decoded.userId).select("-password");

            if (!req.user){
                res.status(401);
                throw new Error("Not authorized , user not found");
            }
            next();
        } catch (error) {
           res.status(401);
           throw new Error("not authorized ,token failed") 
        }
    }
});


const authorizeAdmin=(req:AuthRequest,res:Response,next:NextFunction):void=>{
    if (req.user && req.user.role==="ADMIN"){
        next();
    }else{
        res.status(401).json({message:"Not authorized as an admin"})
    }
}

export {authenticate,authorizeAdmin};