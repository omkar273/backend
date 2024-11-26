import { Request, Response } from "express";
import tempSociety from "../../models/AuthModels/tempRegistrationModel.js";
import Society from "../../models/AuthModels/societyModel.js";
import User from "../../models/AuthModels/userModel.js";
import asyncHandler from './../../utils/asynchandler.js';
import ApiResponse from './../../utils/api_success.js';
import ApiError from './../../utils/api_error.js';
import PricingModel from './../../models/pricing/pricing.model.js';
import Flat from './../../models/AuthModels/flatsModel';
import { Types } from 'mongoose';

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

    // Validate request body
    if (!id) {
      throw new ApiError("ID is required", 400);
    }

    // Find temporary registration
    const tempRegistration = await tempSociety.findById(id);
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

    // Generate society code
    const normalizedSocietyName = society_name.replace(/\s+/g, "").substring(0, 6).toUpperCase();
    const count = await Society.countDocuments();
    const society_code = `${normalizedSocietyName}${count + 1}`;

    // Create new admin user
    const newAdmin = new User({
      name,
      mb_no,
      email,
      society_code,
      isVerified: true,
      role: "admin",
    });

    // Assign admin flat
    const adminFlat = new Flat({
      flat_no: 0,
      society_code,
      flat_type: "undefined",
      floor_no: 0,
      owner_id: newAdmin._id,
      residents: [newAdmin.name],
    });

    await adminFlat.save();
    newAdmin.flat = adminFlat._id as Types.ObjectId;;

    // Save admin user
    const savedAdmin = await newAdmin.save();
    if (!savedAdmin) {
      throw new ApiError("Admin registration failed", 500);
    }

    // Find free pricing tier
    const freeTier = await PricingModel.findOne({ freeTier: true });
    if (!freeTier) {
      throw new ApiError("Pricing model not found", 404);
    }

    // Create new society
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 90);

    const newSociety = new Society({
      society_name,
      society_add,
      society_city,
      society_state,
      society_pincode,
      society_code,
      admin_ids: [savedAdmin._id],
      subscription: {
        pricing_plan_id: freeTier._id,
        start_date: startDate,
        end_date: endDate,
        price: 0,
        flatsCovered: 1,
        status: "active",
      },
    });

    const savedSociety = await newSociety.save();
    if (!savedSociety) {
      throw new ApiError("Society creation failed", 500);
    }

    // Delete temp registration
    await tempSociety.findByIdAndDelete(id);

    // Respond with success
    res.status(200).json(
      new ApiResponse(
        {
          society: savedSociety,
          admin: savedAdmin,
        },
        "Registration processed successfully"
      )
    );
  }
);


export { listPendingRegistrations, processRegistration };
