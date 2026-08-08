import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../errorHelpers/AppError";

export const catchAsync = (fn:RequestHandler)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        try{
            await fn(req,res,next)
        }
        catch(error:any){
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success:false,
                    message:error.message,
                })
                return
            }
            res.status(500).json({
                success:false,
                message:"internal server error",
                error:error.message
            })
        }
    }
}