import { Request, Response } from "express";
import tempSociety from "../../models/AuthModels/tempRegistrationModel.js";
import Society from "../../models/AuthModels/societyModel.js";
import User from "../../models/AuthModels/userModel.js";
import asyncHandler from './../../utils/asynchandler.js';
import ApiResponse from './../../utils/api_success.js';
import ApiError from './../../utils/api_error.js';
import PricingModel from './../../models/pricing/pricing.model';

interface TempRegistration {
  id: string;
  name: string;
  mb_no: string;
  email: string;
  // password: string;
  society_name: string;
  society_add: string;
  society_city: string;
  society_state: string;
  society_pincode: string;
}

interface User {
  // username: string;
  id: string;
  name: string;
  mb_no: string;
  email: string;
  // password: string;
  society_code: string;
  role: string;
}

interface Society {
  id: string;
  society_name: string;
  society_add: string;
  society_city: string;
  society_state: string;
  society_pincode: string;
  society_code: string;
  admin_id: string;
}

const listPendingRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const pendingRegistrations = await tempSociety.find();
    res.status(200).json(new ApiResponse({ pendingRegistrations }, "Pending registrations fetched successfully"));
  });

const processRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.body;
    const tempRegistration = await tempSociety.findOne({ _id: id });
    if (!tempRegistration) {
      throw new ApiError("Registration not found", 404);
    }

    const {
      name,
      mb_no,
      email,
      society_name,
      society_add,
      society_city,
      society_state,
      society_pincode,
    } = tempRegistration;

    const normalizedSocietyName = society_name
      .replace(/\s+/g, "")
      .substring(0, 6)
      .toUpperCase();

    const count = await Society.countDocuments();

    const society_code = `${normalizedSocietyName}${count + 1}`;

    const newAdmin = new User({
      name,
      mb_no,
      email,
      society_code,
      isVerified: true,
      role: "admin",
    });

    const savedAdmin = await newAdmin.save();

    if (!savedAdmin) {
      throw new ApiError("Admin registration failed", 500);
    }

    const admin_id = savedAdmin._id;

    const freeTier = await PricingModel.findOne({ freeTier: true });

    if (!freeTier) {
      throw new ApiError("Pricing model not found", 404);
    }
    const newSociety = new Society({
      society_name,
      society_add,
      society_city,
      society_state,
      society_pincode,
      society_code,
      admin_ids: admin_id,
      subscription: {
        pricing_plan_id: freeTier._id,
        start_date: new Date(),
        end_date: (new Date()).getDate() + 90,
        price: 0,
        flatsCovered: 1,
        status: "active"
      }
    });

    const savedSociety = await newSociety.save();
    await tempSociety.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse({
      society: savedSociety,
      admin: savedAdmin
    },
      "Registration processed successfully"
    ));
  }
)

export { listPendingRegistrations, processRegistration };
