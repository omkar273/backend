import { Request, Response } from "express";
import asyncHandler from "../../utils/asynchandler.js";
import ApiError from "../../utils/api_error.js";
import ApiResponse from "../../utils/api_success.js";
import PricingModel from "../../models/pricing/pricing.model.js";

// Controller to delete a pricing plan by ID
export const deletePricingPlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate the ID
    if (!id) {
        throw new ApiError("Pricing plan ID is required.", 400);
    }

    // Check if the pricing plan exists
    const pricingPlan = await PricingModel.findById(id);
    if (!pricingPlan) {
        throw new ApiError(`Pricing plan with ID ${id} not found.`, 404);
    }

    // Delete the pricing plan
    await PricingModel.findByIdAndDelete(id);

    // Respond to the client
    res.status(200).json(new ApiResponse({}, "Pricing plan deleted successfully."));
});
