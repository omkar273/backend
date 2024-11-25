import { Request, Response } from "express";
import Visitor from "../../models/VisitorManagement/tempVisitorModel.js";
import ApiResponse from './../../utils/api_success.js';
import asyncHandler from './../../utils/asynchandler.js';

interface CheckinRequestBody {
  society_code: string;
  visitor_name: string;
  visitor_contact_no: string;
  visiting_to: string;
  visit_purpose: string;
  visitor_add: string;
  visitor_address: string;
  flat_no: string;
  no_of_people: string;
}

const checkIn = asyncHandler(async (
  req: Request<{}, {}, CheckinRequestBody>,
  res: Response
) => {
  const file = req.file;

  const {
    society_code,
    visitor_name,
    visitor_contact_no,
    visiting_to,
    visit_purpose,
    visitor_address,
    flat_no,
    no_of_people,
  } = req.body;

  // if (!file) {
  //   throw new Error("Please send the image of the visitor");
  // }

  const tempCheckIn = new Visitor({
    society_code,
    visit_purpose,
    visiting_to,
    visitor_name,
    flat_no,
    no_of_people,
    visitor_address,
    visitor_contact_no,
    checkin_date: Date.now(),
    image_url: file ? (file as any).location : null,
    image_key: file ? (file as any).key : null,
  });

  const tempCheckInData = await tempCheckIn.save();
  res.status(200).json(new ApiResponse({ checkIn: tempCheckInData }, "Visitor checked in successfully"));
});

export default checkIn;
