import express from "express"

import {
    loginUser,
    logoutUser,
    getAllUsers,
    deleteUserById,
} from "../controllers/user.controller.js"

import { authenticate,authorizeAdmin } from "../middlewares/auth.middleware.js"

const router = express.Router();

//userroutes
router.post("/auth",loginUser);
router.post("/logout",logoutUser);

//admin routes
router.route("/").get(authenticate,authorizeAdmin,getAllUsers);
router.delete("/:id",authenticate,authorizeAdmin,deleteUserById);


export default router;