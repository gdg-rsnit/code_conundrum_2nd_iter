import { User, type IUser } from "../models/userModel.js";
import { Team } from "../models/teamModel.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import type { Request, Response } from "express";
import { loginUserSchema } from "../../schemas/userSchema.js";
import { WaitingPresence } from "../models/waitingPresenceModel.js";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  const { email, password } = result.data;

  // Try to find user by email first
  let existingUser = await User.findOne({ email }).select("+password");

  // If not found, try to find by teamName
  if (!existingUser) {
    const team = await Team.findOne({ teamName: email });
    if (team) {
      existingUser = await User.findOne({ teamId: team._id }).select("+password");
    }
  }

  if (!existingUser) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (existingUser.banned) {
    return res.status(403).json({ success: false, message: "This account has been banned" });
  }

  if (existingUser.role === "TEAM" && existingUser.teamId) {
    const linkedTeam = await Team.findById(existingUser.teamId).select("banned").lean();
    if (linkedTeam?.banned) {
      return res.status(403).json({ success: false, message: "This team has been banned" });
    }
  }

  createToken(res, existingUser._id.toString());

  // If it's a TEAM user, we might want to include team info
  let teamInfo = null;
  if (existingUser.role === "TEAM" && existingUser.teamId) {
    teamInfo = await Team.findById(existingUser.teamId);
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      team: teamInfo,
    },
  });
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  if (authReq.user?.role === "TEAM" && authReq.user.teamId) {
    await WaitingPresence.deleteOne({ teamId: authReq.user.teamId });
  }

  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success:true,message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find({}).select("-password");
    res.status(200).json({ data:users,success:true });
  }
);

const deleteUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({success:false,message:"Not authorized to delete users"});
    }

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({success:false,message:"User not found"});
    }

    if (user.role === "ADMIN") {
      res.status(400).json({success:false,message:"Cannot delete admin users"});
    }

    await User.deleteOne({ _id: user._id });

   return  res.status(200).json({ message: "User deleted successfully" });
  }
);

export { loginUser, logoutUser, getAllUsers, deleteUserById};