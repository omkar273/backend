import { Request, Response } from "express";
import mongoose from "mongoose";
import generateTokens from "../../utils/jwt/generateToken.js";
import User from "../../models/AuthModels/userModel.js";
import TempUser from "../../models/AuthModels/tempUserModel.js";
import Society from "../../models/AuthModels/societyModel.js";
import assignFlat from "../../utils/society/assignFlats.js";
import asyncHandler from './../../utils/asynchandler.js';
import ApiError from './../../utils/api_error.js';
import ApiResponse from './../../utils/api_success.js';

const getPendingUsers = asyncHandler(
  async (req: Request<{ society_code: string }>, res: Response) => {
    const { society_code } = req.params;
    console.log(society_code);

    const society = await Society.findOne({ society_code });
    if (!society) {
      throw new ApiError("Invalid Society code", 404);
    }

    const pendingUsers = await User.find({
      society_code,
      tempUserId: { $exists: true },
    }).populate("tempUserId");

    if (!pendingUsers.length) {
      throw new ApiError("No pending users found for this society", 404);
    }

    const formattedPendingUsers = pendingUsers.map((user) => ({
      id: user._id,
      name: user.name,
      mb_no: user.mb_no,
      email: user.email,
      flat_no: user.flat_no,
      floor_no: (user.tempUserId as any)?.floor_no,
      flat_type: (user.tempUserId as any)?.flat_type,
      tempUserId: (user.tempUserId as any)?._id,
    }));

    res.status(200).json(
      new ApiResponse(
        { pendingUsers: formattedPendingUsers },
        "Pending users fetched successfully"
      )
    );
  }
);



const processUsers = asyncHandler(
  async (req: Request<{}, {}, { id: string }>, res: Response) => {
    // Extract user ID from request body
    const { id } = req.body;

    console.log('id ', id);
    const tempUser = await TempUser.findOne({ user_id: id });
    console.log('temp user ', tempUser);


    const user = await User.findById(id);
    console.log('normal user in collection ', user);

    if (!tempUser || !user) {
      throw new ApiError("Registration request not found", 404);
    }

    const loggedInUserId = req.user._id;
    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      throw new ApiError("Logged-in user not found", 401);
    }

    // Ensure the logged-in user and the pending user belong to the same society
    const society = await Society.findOne({ society_code: loggedInUser.society_code });

    if (!society || society.society_code !== tempUser.society_code) {
      throw new ApiError("You are not authorized to process users for this society", 403);
    }

    // Mark user as verified and assign a role
    user.isVerified = true;
    user.role = "user";

    // Assign a flat to the user (via external utility)
    const assignedFlat = await assignFlat(user);
    user.flat = assignedFlat._id;

    // Save the updated user details
    const savedUser = await user.save();

    // Delete the temporary user record
    await TempUser.findOneAndDelete({ user_id: id });


    res.status(200).json(
      new ApiResponse(
        { user: savedUser },
        "User verified and processed successfully"
      )
    );
  }
);


export { getPendingUsers, processUsers };