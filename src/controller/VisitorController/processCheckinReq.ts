import { Request, Response } from "express";
import User from "../../models/AuthModels/userModel.js";
import tempVisitor from "../../models/VisitorManagement/tempVisitorModel.js";
import Visitor from "../../models/VisitorManagement/visitorModel.js";
import asyncHandler from './../../utils/asynchandler.js';
import ApiError from './../../utils/api_error.js';
import ApiResponse from './../../utils/api_success.js';

const pendingCheckin = asyncHandler(async (req: Request, res: Response) => {
  const { flat_no } = req.params;
  const pendingCheckin = await tempVisitor
    .find({ flat_no })
    .sort({ createdAt: -1 });

  if (pendingCheckin.length === 0) {
    res.status(200).json({ msg: "No pending checkin request" });
    return;
  }

  const loggedInUserId = req.user?._id;

  if (!loggedInUserId) {
    res.status(401).json({ errorMsg: "Unauthorized user" });
    return;
  }

  const user = await User.findById(loggedInUserId);

  if (!user) {
    res.status(404).json({ errorMsg: "User not found" });
    return;
  }

  if (user.flat_no != flat_no) {
    res.status(404).json({ errorMsg: "User belongs to another flat" });
    return;
  }

  res.status(200).json({ data: pendingCheckin });
  return;
});

const processCheckin = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.body;
    const checkinRequest = await tempVisitor.findOne({ _id: id });
    if (!checkinRequest) {
      throw new ApiError("Checkin request not found", 404);
    }

    const {
      society_code,
      visitor_name,
      visitor_contact_no,
      visiting_to,
      visit_purpose,
      flat_no,
      no_of_people,
      visitor_address,
      checkin_date,
      image_url,
      image_key,
    } = checkinRequest;

    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      throw new ApiError("Unauthorized user", 401);
    }

    const user = await User.findById(loggedInUserId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const newCheckin = new Visitor({
      society_code,
      visitor_name,
      visitor_contact_no,
      visiting_to,
      visit_purpose,
      flat_no,
      no_of_people,
      visitor_address,
      checkin_date,
      image_url,
      image_key,
    });

    await newCheckin.save();

    await tempVisitor.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse({ checkin: newCheckin }, "Visitor checked in successfully"));
  }
);

export { pendingCheckin, processCheckin };
