import jwt, { type SignOptions } from "jsonwebtoken"
import type { Response } from "express";

const DEFAULT_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieMaxAgeMs = (): number => {
    const parsed = Number(process.env.JWT_COOKIE_MAX_AGE_MS);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    return DEFAULT_COOKIE_MAX_AGE_MS;
};

const createToken=(res:Response,userId:string):string=>{
    const cookieMaxAge = getCookieMaxAgeMs();
    let jwtExpiresIn: NonNullable<SignOptions["expiresIn"]> = "7d";
    if (process.env.JWT_EXPIRES_IN) {
        jwtExpiresIn = process.env.JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>;
    }
    const token=jwt.sign({userId},process.env.JWT_SECRET! as string,{expiresIn:jwtExpiresIn});

    res.cookie('jwt',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV!=='development',
        sameSite:"strict",
        maxAge:cookieMaxAge,
    });
    return token;
}

export default createToken;